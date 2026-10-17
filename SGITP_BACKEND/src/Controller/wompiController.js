import fetch from "node-fetch";
import { config } from "../config.js";

//Array de funciones
const wompiController = {};

// Pide un token de acceso a Wompi con las credenciales de la tienda.
const requestWompiToken = () =>
  fetch("https://id.wompi.sv/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: config.wompi.grant_type,
      audience: config.wompi.audience,
      client_id: config.wompi.client_id,
      client_secret: config.wompi.client_secret,
    }),
  });

//Generar token
wompiController.generarToken = async (req, res) => {
  try {
    const response = await fetch("https://id.wompi.sv/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: config.wompi.grant_type,
        audience: config.wompi.audience,
        client_id: config.wompi.client_id,
        client_secret: config.wompi.client_secret,
      }),
    });

    if (!response.ok) {
      console.log("wompi error:", await response.text());
      return res.status(502).json({ message: "La pasarela de pago rechazó la operación" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

//---------------- TRANSACCIÓN DE PRUEBA ------------------
//wompiController.paymentTest = async (req, res) => {
  //try {
    //#1- Solicito los datos
   // const { token, formData } = req.body;

    //Hago fetch
   // const response = await fetch(
  //    "https://api.wompi.sv/TransaccionCompra/TokenizadaSin3Ds",
     // {
     //   method: "POST",
     //   headers: {
      //    "Content-Type": "application/json",
       //   Authorization: `Bearer ${token}`,
       // },
       // body: JSON.stringify(formData),
     // },
   // );

   // if (!response.ok) {
   //   const error = await response.text();
   //   return res.status(500).json({ error });
   // }

   // const data = await response.json();
   // return res.status(200).json(data);
 // } catch (error) {
   // console.log("error" + error);
  //  return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
 // }
//};


//TRANSACCIÓN REAL
//Endpoint para el pago real con tarjeta
//se pueden hacer pruebas con datos de 0.01 de dinero
wompiController.payment3ds = async (req, res) => {
  try {
    const { formData } = req.body;

    if (!formData || typeof formData !== "object") {
      return res.status(400).json({ message: "Datos de pago inválidos" });
    }

    // El token se obtiene aquí y nunca viaja al cliente.
    const tokenResponse = await requestWompiToken();
    if (!tokenResponse.ok) {
      return res.status(502).json({ message: "No se pudo conectar con la pasarela de pago" });
    }
    const { access_token: token } = await tokenResponse.json();

    const response = await fetch("https://api.wompi.sv/TransaccionCompra/3Ds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      console.log("wompi error:", await response.text());
      return res.status(502).json({ message: "La pasarela de pago rechazó la operación" });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default wompiController;