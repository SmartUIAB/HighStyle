const path = require("path");
const fs = require("fs");
const { finished } = require("stream/promises");
const { v4: uuidv4 } = require("uuid"); // Ensure the uuid package is installed

// Function to upload the file
const upload = async (file, subpath = "") => {
  try {
    const { createReadStream, filename } = file.file;
    const stream = createReadStream();

    // Ensure the upload directory exists
    const uploadDir = path.join(__dirname, "../uploads", subpath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a random ID for the file
    const randomId = uuidv4();

    // Sanitize the filename by replacing spaces and invalid characters
    const sanitizedFilename = filename
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/[^\w.-]/g, ""); // Remove any characters that are not alphanumeric, underscores, or periods

    // Create a new filename using the random ID
    const newFilename = `${randomId}_${sanitizedFilename}`;

    // Set the file path
    const filePath = path.join(uploadDir, newFilename);

    // Create a write stream
    const writeStream = fs.createWriteStream(filePath);

    // Pipe the file stream to the destination
    stream.pipe(writeStream);

    // Wait for the stream to finish
    await finished(writeStream);

    // Return the file path in the format expected by your application
    return `/uploads/${subpath}/${newFilename}`;
  } catch (error) {
    // Handle any errors
    console.error("Error during file upload:", error);
    throw new Error("File upload failed");
  }
};

module.exports = { upload };
