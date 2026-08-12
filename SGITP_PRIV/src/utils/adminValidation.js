const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export function isObjectId(value) {
  return OBJECT_ID_PATTERN.test(String(value || "").trim());
}

function isBlank(value) {
  return String(value ?? "").trim() === "";
}

function hasMinLength(value, length) {
  return String(value ?? "").trim().length >= length;
}

function isPositiveNumber(value) {
  return !Number.isNaN(Number(value)) && Number(value) > 0;
}

function isNonNegativeNumber(value) {
  return !Number.isNaN(Number(value)) && Number(value) >= 0;
}

// Each validator returns the first user-facing error so pages can stop before
// calling the API with incomplete or invalid CRUD payloads.
export function validateClientPayload(payload) {
  if (isBlank(payload.full_name)) return "El nombre del cliente es obligatorio.";
  if (!hasMinLength(payload.full_name, 3)) {
    return "El nombre debe tener al menos 3 caracteres.";
  }
  if (payload.email && !EMAIL_PATTERN.test(payload.email.trim())) {
    return "Ingresa un correo valido para el cliente.";
  }

  return "";
}

export function validateExpensePayload(payload) {
  if (isBlank(payload.descriptions || payload.description)) {
    return "La descripcion del gasto es obligatoria.";
  }
  if (!isPositiveNumber(payload.amount)) {
    return "El monto debe ser mayor a cero.";
  }
  if (isBlank(payload.expense_type)) return "La categoria del gasto es obligatoria.";
  if (isBlank(payload.payment_method)) return "El metodo de pago es obligatorio.";

  return "";
}

export function validateBranchPayload(payload) {
  if (isBlank(payload.name)) return "El nombre de la sucursal es obligatorio.";
  if (!hasMinLength(payload.name, 3)) {
    return "El nombre debe tener al menos 3 caracteres.";
  }
  if (isBlank(payload.address)) return "La direccion de la sucursal es obligatoria.";
  if (isBlank(payload.phone)) return "El telefono de la sucursal es obligatorio.";
  if (payload.email && !EMAIL_PATTERN.test(payload.email.trim())) {
    return "Ingresa un correo valido para la sucursal.";
  }

  return "";
}

export function validatePromotionPayload(payload) {
  if (isBlank(payload.coupon_code)) return "El codigo del cupon es obligatorio.";
  if (!/^[a-zA-Z0-9]+$/.test(payload.coupon_code.trim())) {
    return "El codigo solo puede contener letras y numeros.";
  }
  if (!isNonNegativeNumber(payload.discount_percentage)) {
    return "El descuento debe ser un numero valido.";
  }
  if (Number(payload.discount_percentage) > 100) {
    return "El descuento no puede ser mayor a 100.";
  }
  if (!payload.start_date || !payload.end_date) {
    return "Debes seleccionar fecha de inicio y fecha final.";
  }
  if (new Date(payload.end_date) <= new Date(payload.start_date)) {
    return "La fecha final debe ser posterior a la fecha de inicio.";
  }

  return "";
}

export function validateProductPayload(payload) {
  const getValue = (key) => {
    if (payload instanceof FormData) return payload.get(key);
    return payload?.[key];
  };

  if (isBlank(getValue("name"))) return "El nombre del producto es obligatorio.";
  if (isBlank(getValue("description"))) {
    return "La descripcion del producto es obligatoria.";
  }
  if (isBlank(getValue("category"))) return "La categoria es obligatoria.";
  if (!isNonNegativeNumber(getValue("price"))) return "El precio debe ser valido.";
  if (!isNonNegativeNumber(getValue("cost"))) return "El costo debe ser valido.";

  return "";
}
