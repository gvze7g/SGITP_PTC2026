import bcryptjs from "bcryptjs";
import employeeModel from "../Model/employee.js";

// Crea el primer administrador del panel privado. Solo actúa la primera vez
// que el sistema arranca con la base vacía: si ya existe algún
// administrador, no hace nada. Las credenciales se pueden cambiar con
// ADMIN_EMAIL y ADMIN_PASSWORD en el .env.
const DEFAULT_ADMIN_EMAIL = "admin@peques.com";
const DEFAULT_ADMIN_PASSWORD = "Admin123!";

export async function seedAdmin() {
  try {
    const adminExists = await employeeModel.exists({ role: "Administrator" });
    if (adminExists) return;

    const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

    await employeeModel.create({
      full_name: "Administrador",
      email,
      password: await bcryptjs.hash(password, 10),
      role: "Administrator",
      position: "Administrador",
      hire_date: new Date(),
      isVerified: true,
    });

    console.log(`Administrador inicial creado: ${email}`);
  } catch (error) {
    console.error("No se pudo crear el administrador inicial:", error.message);
  }
}
