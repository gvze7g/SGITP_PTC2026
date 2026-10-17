import payrollModel from "../Model/payroll.js";
import employeeModel from "../Model/employee.js";
import {
  parsePayrollPeriod,
  toDateString,
  toStoredDate,
  validatePastDate,
  validatePayrollPeriod,
} from "../utils/dates.js";
import { isValidObjectId } from "../utils/validators.js";

// Mes ("AAAA-MM") en que se contrató al empleado, o null si no tiene fecha.
const hireMonth = (employee) => toDateString(employee?.hire_date)?.slice(0, 7) || null;

const payrollController = {};

const populatePayroll = (query) =>
  query.populate({
    path: "employee_id",
    select: "full_name position branch_id",
    populate: { path: "branch_id", select: "name" },
  });

// SELECT
payrollController.getPayrolls = async (req, res) => {
  try {
    const payrolls = await populatePayroll(payrollModel.find()).sort({ createdAt: -1 });
    return res.status(200).json(payrolls);
  } catch (error) {
    console.log("getPayrolls error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// INSERTAR: crea una nomina pendiente para un solo empleado en un periodo dado
payrollController.insertPayroll = async (req, res) => {
  try {
    const employee_id = req.body?.employee_id;
    const period = (req.body?.period || "").trim();

    if (!employee_id || !period) {
      return res.status(400).json({ message: "El empleado y el periodo son obligatorios." });
    }

    const periodError = validatePayrollPeriod(period);
    if (periodError) {
      return res.status(400).json({ message: periodError });
    }

    if (!isValidObjectId(employee_id)) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }

    const employee = await employeeModel.findById(employee_id);

    if (!employee) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }

    // No hay nómina de meses en que la persona todavía no trabajaba aquí.
    const hiredIn = hireMonth(employee);
    if (hiredIn && parsePayrollPeriod(period) < hiredIn) {
      return res
        .status(400)
        .json({ message: "El periodo es anterior a la fecha de contratación del empleado." });
    }

    const existing = await payrollModel.findOne({ employee_id, period });

    if (existing) {
      return res.status(400).json({
        message: "Ya existe una nomina para este empleado en este periodo.",
      });
    }

    const created = await payrollModel.create({
      employee_id,
      period,
      base_salary: Number(employee.base_salary || 0),
      bonuses: 0,
      deductions: 0,
      net_salary: Number(employee.base_salary || 0),
      status: "Pendiente",
    });

    const payroll = await populatePayroll(payrollModel.findById(created._id));

    return res.status(201).json({ message: "Nómina creada", payroll });
  } catch (error) {
    console.log("insertPayroll error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// GENERAR NOMINA DEL MES: crea un registro pendiente por cada empleado que
// todavia no tenga nomina para el periodo indicado
payrollController.generatePayroll = async (req, res) => {
  try {
    const period = (req.body?.period || "").trim();

    if (!period) {
      return res.status(400).json({ message: "El periodo es obligatorio." });
    }

    const periodError = validatePayrollPeriod(period);
    if (periodError) {
      return res.status(400).json({ message: periodError });
    }

    const periodMonth = parsePayrollPeriod(period);
    const employees = (await employeeModel.find()).filter((employee) => {
      // Se salta a quien fue contratado después de ese mes.
      const hiredIn = hireMonth(employee);
      return !hiredIn || hiredIn <= periodMonth;
    });
    const existing = await payrollModel.find({ period }).select("employee_id");
    const existingIds = new Set(existing.map((item) => String(item.employee_id)));

    const toCreate = employees
      .filter((employee) => !existingIds.has(String(employee._id)))
      .map((employee) => ({
        employee_id: employee._id,
        period,
        base_salary: Number(employee.base_salary || 0),
        bonuses: 0,
        deductions: 0,
        net_salary: Number(employee.base_salary || 0),
        status: "Pendiente",
      }));

    if (toCreate.length > 0) {
      await payrollModel.insertMany(toCreate);
    }

    const payrolls = await populatePayroll(payrollModel.find({ period })).sort({
      createdAt: -1,
    });

    return res.status(201).json({
      message: "Nomina del periodo generada",
      created: toCreate.length,
      payrolls,
    });
  } catch (error) {
    console.log("generatePayroll error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// ACTUALIZAR (registrar bonos/deducciones y aprobar el pago)
payrollController.updatePayroll = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Nómina no encontrada" });
    }

    const payroll = await payrollModel.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ message: "Nómina no encontrada" });
    }

    const { bonuses, deductions, payment_date, status } = req.body;

    // La fecha de pago registra algo que ya pasó: no puede ser futura.
    const paymentDateError = validatePastDate(payment_date, {
      label: "fecha de pago",
      minDate: "2000-01-01",
    });
    if (paymentDateError) {
      return res.status(400).json({ message: paymentDateError });
    }

    if (bonuses !== undefined) payroll.bonuses = Number(bonuses || 0);
    if (deductions !== undefined) payroll.deductions = Number(deductions || 0);
    if (payment_date !== undefined) {
      const paymentDay = toDateString(payment_date);
      payroll.payment_date = paymentDay ? toStoredDate(paymentDay) : null;
    }
    if (status !== undefined) payroll.status = status;

    payroll.net_salary = Number(payroll.base_salary || 0) + Number(payroll.bonuses || 0) - Number(payroll.deductions || 0);

    await payroll.save();

    const updated = await populatePayroll(payrollModel.findById(payroll._id));

    return res.status(200).json({ message: "Nómina actualizada", payroll: updated });
  } catch (error) {
    console.log("updatePayroll error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// ELIMINAR
payrollController.deletePayroll = async (req, res) => {
  try {
    const deleted = await payrollModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Nómina no encontrada" });
    }

    return res.status(200).json({ message: "Nómina eliminada" });
  } catch (error) {
    console.log("deletePayroll error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default payrollController;
