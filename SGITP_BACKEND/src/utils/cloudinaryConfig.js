import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

const { cloudinary_name, cloudinary_api_key, cloudinary_api_secret } =
  config.cloudinary;

// Bandera que el resto del backend puede consultar antes de intentar subir algo.
// Si el .env no tiene las 3 credenciales, Cloudinary responde con errores poco
// claros ("Must supply api_key"), asi que preferimos detectarlo aqui y avisar.
export const isCloudinaryConfigured = Boolean(
  cloudinary_name && cloudinary_api_key && cloudinary_api_secret
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudinary_name,
    api_key: cloudinary_api_key,
    api_secret: cloudinary_api_secret,
  });
} else {
  console.warn(
    "[Cloudinary] Faltan credenciales en el .env " +
      "(CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). " +
      "La subida de imagenes estara deshabilitada."
  );
}

// Guardamos el archivo en memoria (no en disco) porque de ahi lo mandamos
// directo a Cloudinary con upload_stream.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export const MAX_IMAGE_SIZE_MB = 5;

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
    files: 5,
  },
  // Rechaza cualquier cosa que no sea imagen antes de gastar memoria en ella.
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(null, true);
    }

    const error = new Error(
      "Formato de imagen no permitido. Usa JPG, PNG, WEBP, GIF o AVIF."
    );
    error.code = "INVALID_FILE_TYPE";
    return cb(error);
  },
});

// Sube un buffer de multer a Cloudinary y devuelve el resultado.
// Vive aqui (y no en el controlador) para que cualquier modulo que necesite
// subir imagenes use exactamente la misma configuracion.
export const uploadBufferToCloudinary = (
  buffer,
  folder = "SGITP_BACKEND/products"
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// Borra una imagen de Cloudinary sin tumbar la peticion si falla:
// que no se pueda borrar la imagen vieja no deberia impedir guardar el producto.
export const destroyCloudinaryImage = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("[Cloudinary] No se pudo borrar la imagen " + publicId, error);
  }
};

export { cloudinary };
export default upload;
