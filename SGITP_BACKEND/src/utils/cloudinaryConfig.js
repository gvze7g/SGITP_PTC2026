import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  // Solo imágenes: otro tipo de archivo se rechaza antes de subirlo a Cloudinary.
  fileFilter(req, file, callback) {
    if (/^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)) return callback(null, true);
    const error = new multer.MulterError("INVALID_FILE_TYPE", file.fieldname);
    return callback(error);
  },
});

export { cloudinary };
export default upload;