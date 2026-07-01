import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

export const validateAuthCookie = (allowedUserTypes = []) => {
  return (req, res, next) => {
    try {
      const { authCookie } = req.cookies;

      if (!authCookie) {
        return res.status(401).json({
          message: "No cookie found, authorization required",
        });
      }

      const decoded = jsonwebtoken.verify(authCookie, config.JWT.secret);

      if (
        allowedUserTypes.length > 0 &&
        !allowedUserTypes.includes(decoded.userType)
      ) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.log("Auth middleware error:", error);
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  };
};

export const validateEmployeeRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      if (req.user.userType !== "Employee") {
        return res.status(403).json({
          message: "Employees only",
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Insufficient permissions",
        });
      }

      next();
    } catch (error) {
      console.log("Role middleware error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};