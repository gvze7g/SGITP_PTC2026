import payrollModel from "../Model/payroll.js";
import employeeModel from "../Model/employee.js";

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
    return res.status(500).json({ message: "Internal server error" });
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

    const employee = await employeeModel.findById(employee_id);

    if (!employee) {
      return res.status(404).json({ message: "Empleado no encontrado." });
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

    return res.status(201).json({ message: "Payroll created", payroll });
  } catch (error) {
    console.log("insertPayroll error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    const employees = await employeeModel.find();
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
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ACTUALIZAR (registrar bonos/deducciones y aprobar el pago)
payrollController.updatePayroll = async (req, res) => {
  try {
    const payroll = await payrollModel.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    const { bonuses, deductions, payment_date, status } = req.body;

    if (bonuses !== undefined) payroll.bonuses = Number(bonuses || 0);
    if (deductions !== undefined) payroll.deductions = Number(deductions || 0);
    if (payment_date !== undefined) payroll.payment_date = payment_date;
    if (status !== undefined) payroll.status = status;

    payroll.net_salary = Number(payroll.base_salary || 0) + Number(payroll.bonuses || 0) - Number(payroll.deductions || 0);

    await payroll.save();

    const updated = await populatePayroll(payrollModel.findById(payroll._id));

    return res.status(200).json({ message: "Payroll updated", payroll: updated });
  } catch (error) {
    console.log("updatePayroll error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ELIMINAR
payrollController.deletePayroll = async (req, res) => {
  try {
    const deleted = await payrollModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    return res.status(200).json({ message: "Payroll deleted" });
  } catch (error) {
    console.log("deletePayroll error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default payrollController;
