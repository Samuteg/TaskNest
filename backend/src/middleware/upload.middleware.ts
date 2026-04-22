const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const uploadProfileImage = async (request, reply) => {
  const data = await request.file();
  if (!data) {
    reply.code(400).send({ message: "Nenhum arquivo enviado." });
    return;
  }

  if (data.file.truncated) {
    reply.code(400).send({ message: `A imagem deve ter no máximo ${MAX_FILE_SIZE_MB}MB.` });
    return;
  }

  if (!ALLOWED_MIME_TYPES.has(data.mimetype)) {
    reply.code(400).send({ message: "Formato inválido. Envie JPG, PNG, WEBP ou GIF." });
    return;
  }

  // Read the stream to buffer
  const chunks = [];
  for await (const chunk of data.file) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  // Store the buffer in request
  request.fileBuffer = buffer;
};
