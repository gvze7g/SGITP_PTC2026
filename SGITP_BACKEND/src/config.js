import dotenv from "dotenv";

dotenv.config();

export const config = {
  db: {
    URI: process.env.MONGODB_URI,
  },
  server: {
    port: process.env.SERVER_PORT,
  },
  JWT: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  email: {
    user_email: process.env.EMAIL_USER,
    user_password: process.env.EMAIL_PASSWORD,
  },
  cloudinary: {
    cloudinary_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  wompi: {
    grant_type: process.env.GRANT_TYPE,
    audience: process.env.AUDIENCE,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  },
};