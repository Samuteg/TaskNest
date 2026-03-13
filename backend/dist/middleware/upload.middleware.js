import multer from "multer";
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);
const uploader = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            cb(new Error("Formato inválido. Envie JPG, PNG, WEBP ou GIF."));
            return;
        }
        cb(null, true);
    },
});
export const uploadProfileImage = (req, res, next) => {
    uploader.single("profileImage")(req, res, (error) => {
        if (!error) {
            next();
            return;
        }
        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            res
                .status(400)
                .json({ message: `A imagem deve ter no máximo ${MAX_FILE_SIZE_MB}MB.` });
            return;
        }
        res.status(400).json({ message: error.message || "Arquivo inválido." });
    });
};
