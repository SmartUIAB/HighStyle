"use strict";
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { pipeline } = require("node:stream/promises");
const { Transform } = require("node:stream");
const { UPLOAD_ROOT, beneath, realStoragePath } = require("../Security/storage");
const CustomError = require("./CustomError");
const TYPES = {
  "image/jpeg": { extension: ".jpg", matches: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { extension: ".png", matches: b => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  "image/gif": { extension: ".gif", matches: b => ["GIF87a", "GIF89a"].includes(b.subarray(0, 6).toString("ascii")) },
  "image/webp": { extension: ".webp", matches: b => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
};

async function upload(value, subpath = "") {
  const resolved = await value;
  const file = resolved?.file || resolved;
  const type = TYPES[file?.mimetype];
  if (!type || typeof file.createReadStream !== "function") throw new CustomError("Only JPEG, PNG, GIF and WebP images are accepted", 400);
  const directory = beneath(UPLOAD_ROOT, subpath);
  await fsp.mkdir(directory, { recursive: true });
  await realStoragePath(directory);
  const filename = `${randomUUID()}${type.extension}`;
  const destination = path.join(directory, filename);
  let bytes = 0;
  let prefix = Buffer.alloc(0);
  let validated = false;
  const validate = new Transform({ transform(chunk, encoding, callback) {
    bytes += chunk.length;
    if (bytes > 8 * 1024 * 1024) return callback(new CustomError("Image exceeds the 8 MiB limit", 413));
    if (!validated) {
      prefix = Buffer.concat([prefix, chunk]);
      if (prefix.length < 12) return callback();
      if (!type.matches(prefix)) return callback(new CustomError("Image content does not match its declared type", 400));
      validated = true;
      callback(null, prefix);
      prefix = null;
    } else callback(null, chunk);
  }, flush(callback) { callback(validated ? null : new CustomError("Invalid or empty image", 400)); } });
  try {
    await pipeline(file.createReadStream(), validate, fs.createWriteStream(destination, { flags: "wx" }));
    return `/uploads/${path.relative(UPLOAD_ROOT, destination).split(path.sep).join("/")}`;
  } catch (error) {
    await fsp.unlink(destination).catch(() => {});
    throw error;
  }
}
module.exports = { upload };
