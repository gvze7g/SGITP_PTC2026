// Fechas "de calendario" (sin hora): nacimiento, contratación, vigencia de
// cupones y ofertas, gastos... Se comparan como texto "AAAA-MM-DD" para que
// la zona horaria del servidor no corra un día las fechas: el panel manda
// "2026-10-20" (o la medianoche de El Salvador en ISO) y "hoy" se calcula en
// la hora de El Salvador, no en la del servidor (UTC).

const STORE_TIME_ZONE = "America/El_Salvador";
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const MIN_EMPLOYEE_AGE = 18;
export const MAX_EMPLOYEE_AGE = 100;

export function todayDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Convierte lo que llegue (texto "AAAA-MM-DD", ISO con hora o Date) a
// "AAAA-MM-DD". Devuelve null si viene vacío y false si no es una fecha real
// (ej. "2026-02-30" o "hola").
export function toDateString(value) {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "string" && DATE_ONLY_PATTERN.test(value.trim())) {
    const text = value.trim();
    const parsed = new Date(`${text}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === text
      ? text
      : false;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;

  // Las fechas guardadas son medianoche UTC del día elegido, y las que manda
  // el panel en ISO son la medianoche de El Salvador (06:00 UTC del mismo
  // día): en ambos casos el día correcto es el de UTC.
  return parsed.toISOString().slice(0, 10);
}

// Suma (o resta) años a "AAAA-MM-DD" manteniendo mes y día.
export function addYears(dateString, years) {
  const [, year, month, day] = DATE_ONLY_PATTERN.exec(dateString);
  return `${String(Number(year) + years).padStart(4, "0")}-${month}-${day}`;
}

// Fecha guardada en Mongo como medianoche UTC del día indicado.
export function toStoredDate(dateString) {
  return new Date(`${dateString}T00:00:00Z`);
}

// Una vigencia (cupón u oferta) aplica todo el día de inicio y todo el día
// final, en hora de El Salvador.
export function isWithinDateRange(startDate, endDate, today = todayDateString()) {
  const start = toDateString(startDate);
  const end = toDateString(endDate);
  if (start && today < start) return false;
  if (end && today > end) return false;
  return true;
}

// Reglas de un empleado: mayor de edad hoy y contratado ya con 18 años. La
// contratación puede ser de hace años, pero no futura. Devuelve el mensaje
// de error o null. Si birth/hire no vienen y required es false, no valida.
export function validateEmployeeDates({ birth_date, hire_date }, { required = true } = {}) {
  const today = todayDateString();
  const birth = toDateString(birth_date);
  const hire = toDateString(hire_date);

  if (birth === false) return "La fecha de nacimiento no es válida";
  if (hire === false) return "La fecha de contratación no es válida";
  if (required && !birth) return "La fecha de nacimiento es obligatoria";
  if (required && !hire) return "La fecha de contratación es obligatoria";

  if (birth) {
    if (birth > addYears(today, -MIN_EMPLOYEE_AGE)) {
      return `El empleado debe tener al menos ${MIN_EMPLOYEE_AGE} años`;
    }
    if (birth < addYears(today, -MAX_EMPLOYEE_AGE)) {
      return "La fecha de nacimiento no es válida";
    }
  }

  if (hire) {
    if (hire > today) return "La fecha de contratación no puede ser futura";
    if (birth && hire < addYears(birth, MIN_EMPLOYEE_AGE)) {
      return `La fecha de contratación debe ser cuando el empleado ya tenía ${MIN_EMPLOYEE_AGE} años`;
    }
  }

  return null;
}

// Vigencia de cupones y ofertas: ni el inicio ni el final pueden quedar antes
// de hoy. Al editar, una fecha que no cambió se acepta aunque ya pasó (así se
// puede editar un cupón que ya empezó sin moverle el inicio).
export function validateValidityDates(
  { start, end },
  { previousStart = null, previousEnd = null, requireBoth = true, label = "la promoción" } = {}
) {
  const today = todayDateString();
  const startDate = toDateString(start);
  const endDate = toDateString(end);

  if (startDate === false || endDate === false) return `Las fechas de ${label} no son válidas`;
  if (requireBoth && (!startDate || !endDate)) return `Las fechas de inicio y final de ${label} son obligatorias`;

  const startChanged = startDate && startDate !== toDateString(previousStart);
  const endChanged = endDate && endDate !== toDateString(previousEnd);

  if (startChanged && startDate < today) {
    return `La fecha de inicio de ${label} no puede ser anterior a hoy`;
  }
  if (endChanged && endDate < today) {
    return `La fecha final de ${label} no puede ser anterior a hoy`;
  }
  if (startDate && endDate && endDate < startDate) {
    return `La fecha final de ${label} no puede ser anterior a la fecha de inicio`;
  }

  return null;
}

// Fechas que registran algo que ya pasó (apertura de sucursal, gasto,
// pago): no pueden ser futuras ni absurdamente viejas.
export function validatePastDate(value, { label, required = false, minDate = "1900-01-01" }) {
  const date = toDateString(value);
  if (date === false) return `La ${label} no es válida`;
  if (!date) return required ? `La ${label} es obligatoria` : null;
  if (date > todayDateString()) return `La ${label} no puede ser futura`;
  if (date < minDate) return `La ${label} no es válida`;
  return null;
}

const PERIOD_MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Periodo de nómina escrito como "Noviembre de 2025" (o "Noviembre 2025").
// Devuelve "AAAA-MM" para poder compararlo, o null si no es un mes real.
export function parsePayrollPeriod(period) {
  const match = /^([A-Za-zÁÉÍÓÚáéíóúÑñ]+)(?: de)? (\d{4})$/i.exec(String(period ?? "").trim());
  if (!match) return null;

  const monthIndex = PERIOD_MONTHS.indexOf(match[1].toLowerCase().replace("setiembre", "septiembre"));
  if (monthIndex === -1) return null;

  return `${match[2]}-${String(monthIndex + 1).padStart(2, "0")}`;
}

// No se paga nómina de meses que todavía no llegan.
export function validatePayrollPeriod(period) {
  const month = parsePayrollPeriod(period);
  if (!month) return "Escribe el periodo como mes y año, por ejemplo: Noviembre de 2025";
  if (month > todayDateString().slice(0, 7)) return "No se puede generar nómina de un mes futuro";
  if (month < "2000-01") return "El periodo no es válido";
  return null;
}

// "2026-10" -> "Octubre de 2026" (forma única con la que se guarda el periodo).
export function formatPayrollPeriod(monthKey) {
  const [year, month] = String(monthKey).split("-").map(Number);
  const name = PERIOD_MONTHS[month - 1] ?? "";
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
}

export function nextMonthKey(monthKey) {
  const [year, month] = String(monthKey).split("-").map(Number);
  return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function currentMonthKey() {
  return todayDateString().slice(0, 7);
}
