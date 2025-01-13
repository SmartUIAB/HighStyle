const path = require("path");
const fs = require("fs");
const { finished } = require("stream/promises");
const { v4: uuidv4 } = require("uuid");

const upload = async (file, subpath = "") => {
  try {
    const { createReadStream, filename } = file.file;
    const stream = createReadStream();

    const uploadDir = path.join(__dirname, "../uploads", subpath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const randomId = uuidv4();

    const sanitizedFilename = filename
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");

    const newFilename = `${randomId}_${sanitizedFilename}`;

    const filePath = path.join(uploadDir, newFilename);

    const writeStream = fs.createWriteStream(filePath);

    stream.pipe(writeStream);

    await finished(writeStream);

    return `/uploads/${subpath}/${newFilename}`;
  } catch (error) {
    console.error("Error during file upload:", error);
    throw new Error("File upload failed");
  }
};

module.exports = { upload };
