"use strict";
const path = require("node:path");
const fs = require("node:fs/promises");
const CustomError = require("../Utilities/CustomError");
const UPLOAD_ROOT = path.resolve(__dirname, "../uploads");

function beneath(root, value) {
  if (typeof value !== "string" || value.includes("\\") || value.includes("\0") || value.split("/").some(part => part === "." || part === "..") || path.isAbsolute(value)) throw new CustomError("Invalid storage path", 400);
  const resolved = path.resolve(root, value);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new CustomError("Invalid storage path", 400);
  return resolved;
}
function storedPath(value) {
  if (typeof value !== "string" || !value.startsWith("/uploads/") || value.includes("?") || value.includes("#")) throw new CustomError("Invalid stored image path", 400);
  return beneath(UPLOAD_ROOT, value.slice("/uploads/".length));
}
async function realStoragePath(file) {
  const [root, real] = await Promise.all([fs.realpath(UPLOAD_ROOT), fs.realpath(file)]);
  const relative = path.relative(root, real);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new CustomError("Storage path escapes the upload directory", 400);
  return real;
}
async function deleteImageFromStorage(value) {
  const file = storedPath(value);
  try { await realStoragePath(file); await fs.unlink(file); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
}
async function moveImageInStorage(oldValue, newValue) {
  const target = newValue.startsWith("/uploads/") ? newValue : `/uploads/${newValue}`;
  const oldFile = storedPath(oldValue);
  const newFile = storedPath(target);
  await realStoragePath(oldFile);
  await fs.mkdir(path.dirname(newFile), { recursive: true });
  await realStoragePath(path.dirname(newFile));
  await fs.rename(oldFile, newFile);
  return target;
}
module.exports = { UPLOAD_ROOT, beneath, storedPath, realStoragePath, deleteImageFromStorage, moveImageInStorage };
