import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

export const SESSION_DURATION_DAYS = 30;

// Un solo lugar donde se arma el token de sesion, para que el login normal,
// el de Google y el de Apple generen exactamente la misma cookie.
export const createSessionToken = (customer) =>
  jsonwebtoken.sign(
    {
      id: customer._id,
      userType: "Customer",
      customerType: customer.customer_type,
    },
    config.JWT.secret,
    { expiresIn: `${SESSION_DURATION_DAYS}d` }
  );

// La web usa la cookie httpOnly (mas segura). React Native no maneja cookies
// de forma confiable entre reinicios, por eso el token tambien se devuelve en
// el body y la app lo guarda en expo-secure-store para mandarlo como
// "Authorization: Bearer".
export const setSessionCookie = (res, token) => {
  res.cookie("authCookie", token, {
    httpOnly: true,
    sameSite: config.cookie.sameSite,
    secure: config.cookie.secure,
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  });
};

// Forma en la que se devuelve el usuario al frontend (nunca incluye password).
export const publicCustomer = (customer) => ({
  id: customer._id,
  full_name: customer.full_name,
  email: customer.email,
  customer_type: customer.customer_type,
  profileImage: customer.profileImage,
  provider: customer.provider,
});
