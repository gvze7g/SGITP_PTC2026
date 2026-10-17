// Reglas de fechas del panel. Son las mismas que valida el backend
// (SGITP_BACKEND/src/utils/dates.js); aqui sirven para limitar el calendario
// y avisar antes de guardar. Todas comparan solo el dia (sin hora).

export const MIN_EMPLOYEE_AGE = 18;
export const MAX_EMPLOYEE_AGE = 100;

export function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function today() {
  return startOfDay(new Date());
}

export function addYears(date, years) {
  const copy = startOfDay(date);
  copy.setFullYear(copy.getFullYear() + years);
  return copy;
}

export function addDays(date, days) {
  const copy = startOfDay(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// "AAAA-MM-DD" con el dia local que eligio el usuario (toISOString puede
// correr el dia segun la zona horaria).
export function toDateInputValue(date) {
  if (!date) return null;
  const value = startOfDay(date);
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

// Fechas guardadas como "AAAA-MM-DD" o medianoche UTC: se leen como ese dia
// local, sin que la zona horaria lo mueva al dia anterior.
export function fromStoredDate(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

// Empleado: mayor de 18 hoy, contratado ya con 18 y nunca a futuro (la
// contratacion si puede ser de hace muchos anos).
export function getEmployeeDatesError(birthDate, hireDate) {
  if (!birthDate) return "La fecha de nacimiento es obligatoria.";
  if (!hireDate) return "La fecha de contratacion es obligatoria.";

  const birth = startOfDay(birthDate);
  const hire = startOfDay(hireDate);

  if (birth > addYears(today(), -MIN_EMPLOYEE_AGE)) {
    return `El empleado debe tener al menos ${MIN_EMPLOYEE_AGE} anos.`;
  }
  if (birth < addYears(today(), -MAX_EMPLOYEE_AGE)) {
    return "La fecha de nacimiento no es valida.";
  }
  if (hire > today()) return "La fecha de contratacion no puede ser futura.";
  if (hire < addYears(birth, MIN_EMPLOYEE_AGE)) {
    return `La fecha de contratacion debe ser cuando el empleado ya tenia ${MIN_EMPLOYEE_AGE} anos.`;
  }

  return "";
}

// Vigencia de cupones y ofertas: inicio y final desde hoy en adelante. Al
// editar se acepta una fecha que no cambio aunque ya haya pasado.
export function getValidityDatesError(
  { start, end },
  { previousStart = null, previousEnd = null, label = "la promocion" } = {}
) {
  if (start && !isSameDay(start, previousStart) && startOfDay(start) < today()) {
    return `La fecha de inicio de ${label} no puede ser anterior a hoy.`;
  }
  if (end && !isSameDay(end, previousEnd) && startOfDay(end) < today()) {
    return `La fecha final de ${label} no puede ser anterior a hoy.`;
  }
  if (start && end && startOfDay(end) < startOfDay(start)) {
    return `La fecha final de ${label} no puede ser anterior a la fecha de inicio.`;
  }
  return "";
}

// Algo que ya ocurrio (gasto, pago, apertura): no puede ser futuro.
export function getPastDateError(date, label, minDate = new Date(1900, 0, 1)) {
  if (!date) return "";
  if (startOfDay(date) > today()) return `La ${label} no puede ser futura.`;
  if (startOfDay(date) < startOfDay(minDate)) return `La ${label} no es valida.`;
  return "";
}

const PERIOD_MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// "Noviembre de 2025" -> no puede ser un mes que todavia no llega.
export function getPayrollPeriodError(period) {
  const match = /^([A-Za-zÁÉÍÓÚáéíóúÑñ]+)(?: de)? (\d{4})$/i.exec(String(period ?? "").trim());
  const monthIndex = match ? PERIOD_MONTHS.indexOf(match[1].toLowerCase()) : -1;

  if (!match || monthIndex === -1) {
    return "Escribe el periodo como mes y año, por ejemplo: Noviembre de 2025.";
  }

  const year = Number(match[2]);
  const now = new Date();
  if (year > now.getFullYear() || (year === now.getFullYear() && monthIndex > now.getMonth())) {
    return "No se puede generar nomina de un mes futuro.";
  }
  if (year < 2000) return "El periodo no es valido.";

  return "";
}
