const path = require("path");
const fs = require("fs");
const { finished } = require("stream/promises");
const { v4: uuidv4 } = require("uuid"); // You need to install the uuid package if not already installed

const upload = async (file, subpath = "", category, subcategory) => {
  const { createReadStream, filename } = file.file;
  const stream = createReadStream();
  const uploadDir = path.join(__dirname, "../uploads", subpath);

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate a random ID
  const randomId = uuidv4();

  // Sanitize the filename by replacing spaces with underscores
  const sanitizedFilename = filename.replace(/\s+/g, "_");

  // Construct the new filename based on the existence of category and subcategory
  const categoryPart = category ? `${category}_` : "";
  const subcategoryPart = subcategory ? `${subcategory}_` : "";
  const newFilename = `${categoryPart}${subcategoryPart}${randomId}${sanitizedFilename}`;

  // Set the file path
  const filePath = path.join(uploadDir, newFilename);
  const writeStream = fs.createWriteStream(filePath);

  // Pipe the file stream to the destination
  stream.pipe(writeStream);

  // Wait for the stream to finish
  await finished(writeStream);

  // Return the file path in the format expected by your application
  return `/uploads/${subpath}/${newFilename}`;
};

module.exports = { upload };
