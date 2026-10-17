import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";
import customerModel from "../Model/customer.js";
import employeeModel from "../Model/employee.js";

export const validateAuthCookie = (allowedUserTypes = []) => {
  return async (req, res, next) => {
    try {
      const { authCookie } = req.cookies || {};

      if (!authCookie) {
        return res.status(401).json({
          message: "Debes iniciar sesión",
        });
      }

      const decoded = jsonwebtoken.verify(authCookie, config.JWT.secret);

      if (
        allowedUserTypes.length > 0 &&
        !allowedUserTypes.includes(decoded.userType)
      ) {
        return res.status(403).json({
          message: "No tienes permisos para entrar aquí",
        });
      }

      // El token dura hasta 30 días: se confirma que la cuenta siga
      // existiendo y se toma el rol ACTUAL de la base. Así, un empleado
      // eliminado o un admin al que le quitaron el rol pierde el acceso de
      // inmediato, no cuando vence su cookie.
      if (decoded.userType === "Employee") {
        const employee = await employeeModel.findById(decoded.id).select("role");
        if (!employee) {
          return res.status(401).json({ message: "Tu sesión expiró, inicia sesión de nuevo" });
        }
        decoded.role = employee.role;
      } else if (decoded.userType === "Customer") {
        const customer = await customerModel.findById(decoded.id).select("customer_type isVerified");
        if (!customer || customer.isVerified === false) {
          return res.status(401).json({ message: "Tu sesión expiró, inicia sesión de nuevo" });
        }
        decoded.customerType = customer.customer_type;
      } else {
        return res.status(401).json({ message: "Tu sesión expiró, inicia sesión de nuevo" });
      }

      req.user = decoded;
      return next();
    } catch (error) {
      console.log("Auth middleware error:", error.message);
      return res.status(401).json({
        message: "Tu sesión expiró, inicia sesión de nuevo",
      });
    }
  };
};

export const validateEmployeeRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Debes iniciar sesión",
        });
      }

      if (req.user.userType !== "Employee") {
        return res.status(403).json({
          message: "Solo los empleados pueden realizar esta acción",
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "No tienes permisos para realizar esta acción",
        });
      }

      next();
    } catch (error) {
      console.log("Role middleware error:", error);
      return res.status(500).json({
        message: "Ocurrió un error en el servidor, intenta de nuevo",
      });
    }
  };
};

// Para rutas públicas del catálogo: si hay una sesión de cliente válida,
// deja en req.customerType su tipo ACTUAL leído de la base (no del token, que
// puede tener días y no reflejar que un admin lo cambió a mayorista). Sin
// sesión, o con una cookie inválida, la ruta sigue funcionando como pública.
export const attachCustomerType = async (req, res, next) => {
  req.customerType = null;

  try {
    const { authCookie } = req.cookies || {};
    if (!authCookie) return next();

    const decoded = jsonwebtoken.verify(authCookie, config.JWT.secret);
    if (decoded?.userType !== "Customer") return next();

    const customer = await customerModel.findById(decoded.id).select("customer_type");
    req.customerType = customer?.customer_type || null;
  } catch {
    req.customerType = null;
  }

  return next();
};
