import payrollModel from "../Model/payroll.js";
import payrollPeriodModel from "../Model/payrollPeriod.js";
import employeeModel from "../Model/employee.js";
import {
  currentMonthKey,
  formatPayrollPeriod,
  nextMonthKey,
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

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

// Un mes cerrado ya no se puede tocar: devuelve el mensaje de error o null.
const getClosedPeriodError = async (monthKey) => {
  if (!monthKey) return null;
  const closed = await payrollPeriodModel.exists({ month: monthKey, status: "Cerrado" });
  return closed
    ? `La nómina de ${formatPayrollPeriod(monthKey)} ya está cerrada y no se puede modificar.`
    : null;
};

// Totales de un conjunto de registros de nómina.
const summarize = (payrolls) => {
  const paid = payrolls.filter((item) => item.status === "Pagado");
  return {
    employees: payrolls.length,
    base_total: roundMoney(payrolls.reduce((sum, item) => sum + Number(item.base_salary || 0), 0)),
    bonuses_total: roundMoney(payrolls.reduce((sum, item) => sum + Number(item.bonuses || 0), 0)),
    deductions_total: roundMoney(payrolls.reduce((sum, item) => sum + Number(item.deductions || 0), 0)),
    net_total: roundMoney(payrolls.reduce((sum, item) => sum + Number(item.net_salary || 0), 0)),
    paid_total: roundMoney(paid.reduce((sum, item) => sum + Number(item.net_salary || 0), 0)),
    paid_count: paid.length,
    pending_count: payrolls.length - paid.length,
  };
};

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

    const closedError = await getClosedPeriodError(parsePayrollPeriod(period));
    if (closedError) {
      return res.status(400).json({ message: closedError });
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

    // Siempre se guarda con la misma forma ("Octubre de 2026"), así cada mes
    // se agrupa bien aunque se haya escrito "octubre 2026".
    const periodLabel = formatPayrollPeriod(parsePayrollPeriod(period));
    const existing = await payrollModel.findOne({ employee_id, period: periodLabel });

    if (existing) {
      return res.status(400).json({
        message: "Ya existe una nomina para este empleado en este periodo.",
      });
    }

    const created = await payrollModel.create({
      employee_id,
      period: periodLabel,
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
    const closedError = await getClosedPeriodError(periodMonth);
    if (closedError) {
      return res.status(400).json({ message: closedError });
    }

    const periodLabel = formatPayrollPeriod(periodMonth);
    const employees = (await employeeModel.find()).filter((employee) => {
      // Se salta a quien fue contratado después de ese mes.
      const hiredIn = hireMonth(employee);
      return !hiredIn || hiredIn <= periodMonth;
    });
    const existing = await payrollModel.find({ period: periodLabel }).select("employee_id");
    const existingIds = new Set(existing.map((item) => String(item.employee_id)));

    const toCreate = employees
      .filter((employee) => !existingIds.has(String(employee._id)))
      .map((employee) => ({
        employee_id: employee._id,
        period: periodLabel,
        base_salary: Number(employee.base_salary || 0),
        bonuses: 0,
        deductions: 0,
        net_salary: Number(employee.base_salary || 0),
        status: "Pendiente",
      }));

    if (toCreate.length > 0) {
      await payrollModel.insertMany(toCreate);
    }

    await payrollPeriodModel.updateOne(
      { month: periodMonth },
      { $setOnInsert: { month: periodMonth, period: periodLabel, status: "Abierto" } },
      { upsert: true }
    );

    const payrolls = await populatePayroll(payrollModel.find({ period: periodLabel })).sort({
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

    const closedError = await getClosedPeriodError(parsePayrollPeriod(payroll.period));
    if (closedError) {
      return res.status(400).json({ message: closedError });
    }

    const { bonuses, deductions, payment_date, status } = req.body;

    if (status !== undefined && !["Pendiente", "Pagado"].includes(status)) {
      return res.status(400).json({ message: "Estado de pago inválido" });
    }

    for (const [label, value] of [["bonos", bonuses], ["deducciones", deductions]]) {
      if (value !== undefined && !(Number(value) >= 0)) {
        return res.status(400).json({ message: `Los ${label} deben ser un número de 0 o más` });
      }
    }

    if (Number(payroll.base_salary || 0) + Number(bonuses ?? payroll.bonuses ?? 0) < Number(deductions ?? payroll.deductions ?? 0)) {
      return res.status(400).json({ message: "Las deducciones no pueden ser mayores que el salario más los bonos" });
    }

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
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Nómina no encontrada" });
    }

    const payroll = await payrollModel.findById(req.params.id);
    if (payroll) {
      const closedError = await getClosedPeriodError(parsePayrollPeriod(payroll.period));
      if (closedError) {
        return res.status(400).json({ message: closedError });
      }
    }

    const deleted = payroll ? await payrollModel.findByIdAndDelete(req.params.id) : null;

    if (!deleted) {
      return res.status(404).json({ message: "Nómina no encontrada" });
    }

    return res.status(200).json({ message: "Nómina eliminada" });
  } catch (error) {
    console.log("deletePayroll error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// MESES: cada mes con nómina (o el actual), con su estado y totales. Los
// cerrados devuelven el resumen que se guardó al cerrarlos.
payrollController.getPeriods = async (req, res) => {
  try {
    const [payrolls, savedPeriods] = await Promise.all([
      payrollModel.find().select("period base_salary bonuses deductions net_salary status"),
      payrollPeriodModel.find(),
    ]);

    const byMonth = new Map();
    const ensure = (month) => {
      if (!byMonth.has(month)) byMonth.set(month, { month, period: formatPayrollPeriod(month), items: [] });
      return byMonth.get(month);
    };

    payrolls.forEach((payroll) => {
      const month = parsePayrollPeriod(payroll.period);
      if (month) ensure(month).items.push(payroll);
    });
    savedPeriods.forEach((saved) => ensure(saved.month).saved = saved);
    ensure(currentMonthKey());

    const periods = [...byMonth.values()]
      .sort((a, b) => b.month.localeCompare(a.month))
      .map(({ month, period, items, saved }) => {
        const isClosed = saved?.status === "Cerrado";
        return {
          month,
          period,
          status: isClosed ? "Cerrado" : "Abierto",
          is_future: month > currentMonthKey(),
          closed_at: saved?.closed_at ?? null,
          ...summarize(items),
          ...(isClosed ? { closed_summary: saved.summary } : {}),
        };
      });

    return res.status(200).json(periods);
  } catch (error) {
    console.log("getPeriods error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// CERRAR MES: guarda el resumen del mes, lo bloquea y deja abierto el
// siguiente para empezar sus pagos. Solo se cierra si todos están pagados.
payrollController.closePeriod = async (req, res) => {
  try {
    const period = String(req.body?.period || "").trim();
    const periodError = validatePayrollPeriod(period);
    if (periodError) {
      return res.status(400).json({ message: periodError });
    }

    const month = parsePayrollPeriod(period);
    const periodLabel = formatPayrollPeriod(month);

    const closedError = await getClosedPeriodError(month);
    if (closedError) {
      return res.status(400).json({ message: `La nómina de ${periodLabel} ya estaba cerrada.` });
    }

    const payrolls = (await payrollModel.find()).filter((item) => parsePayrollPeriod(item.period) === month);
    if (payrolls.length === 0) {
      return res
        .status(400)
        .json({ message: `No hay nómina registrada en ${periodLabel}. Genera la nómina antes de cerrar el mes.` });
    }

    const summary = summarize(payrolls);
    if (summary.pending_count > 0) {
      return res.status(400).json({
        message: `No se puede cerrar ${periodLabel}: faltan ${summary.pending_count} pago(s) pendiente(s). Registra todos los pagos primero.`,
      });
    }

    const closed = await payrollPeriodModel.findOneAndUpdate(
      { month },
      {
        month,
        period: periodLabel,
        status: "Cerrado",
        closed_at: new Date(),
        closed_by: req.user.id,
        summary: {
          employees: summary.employees,
          base_total: summary.base_total,
          bonuses_total: summary.bonuses_total,
          deductions_total: summary.deductions_total,
          net_total: summary.net_total,
        },
      },
      { upsert: true, new: true }
    );

    const nextMonth = nextMonthKey(month);
    await payrollPeriodModel.updateOne(
      { month: nextMonth },
      { $setOnInsert: { month: nextMonth, period: formatPayrollPeriod(nextMonth), status: "Abierto" } },
      { upsert: true }
    );

    return res.status(200).json({
      message: `Nómina de ${periodLabel} cerrada. ${formatPayrollPeriod(nextMonth)} queda abierta.`,
      period: closed,
      next_period: formatPayrollPeriod(nextMonth),
      next_month: nextMonth,
    });
  } catch (error) {
    console.log("closePeriod error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default payrollController;
