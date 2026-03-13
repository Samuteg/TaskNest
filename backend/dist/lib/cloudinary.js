import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";
const hasCloudinaryConfig = Boolean(ENV.CLOUDINARY_CLOUD_NAME &&
    ENV.CLOUDINARY_API_KEY &&
    ENV.CLOUDINARY_API_SECRET);
if (hasCloudinaryConfig) {
    cloudinary.config({
        cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
        api_key: ENV.CLOUDINARY_API_KEY,
        api_secret: ENV.CLOUDINARY_API_SECRET,
    });
}
export const isCloudinaryConfigured = () => hasCloudinaryConfig;
const uploadBuffer = (buffer, folder) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
        folder,
        resource_type: "image",
    }, (error, result) => {
        if (error) {
            reject(error);
            return;
        }
        resolve(result);
    });
    stream.end(buffer);
});
export const uploadProfileImageToCloudinary = async (buffer, userId) => {
    if (!hasCloudinaryConfig) {
        throw new Error("Cloudinary não configurado no servidor.");
    }
    return uploadBuffer(buffer, `tasknest/users/${userId}/profile`);
};
