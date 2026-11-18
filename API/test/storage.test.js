"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { Readable } = require("node:stream");
const { randomUUID } = require("node:crypto");
const { upload } = require("../Utilities/upload");
const { UPLOAD_ROOT, beneath, storedPath, deleteImageFromStorage } = require("../Security/storage");
const directory = `ci-images-${randomUUID()}`;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.alloc(32)]);
let external;
before(async () => { await fs.mkdir(path.join(UPLOAD_ROOT, directory), { recursive: true }); external = await fs.mkdtemp(path.join(os.tmpdir(), "highstyle-storage-")); });
after(async () => { await fs.rm(path.join(UPLOAD_ROOT, directory), { recursive: true, force: true }); await fs.rm(external, { recursive: true, force: true }); });
const file = (buffer, mimetype = "image/png") => ({ filename: "untrusted-name.html", mimetype, createReadStream: () => Readable.from([buffer]) });

test("safe uploads use server-generated names, extension and a contained path", async () => {
  const url = await upload(Promise.resolve(file(png)), directory);
  assert.match(url, /^\/uploads\/ci-images-[^/]+\/[a-f0-9-]+\.png$/);
  assert.deepEqual(await fs.readFile(storedPath(url)), png);
  await deleteImageFromStorage(url);
  await deleteImageFromStorage(url); // idempotent cleanup
});
test("HTML/SVG and mismatched content types are refused", async () => {
  await assert.rejects(upload(file(Buffer.from("<html>bad content</html>")), directory), error => error.statusCode === 400);
  await assert.rejects(upload(file(Buffer.from("<svg></svg>"), "image/svg+xml"), directory), error => error.statusCode === 400);
});
test("path traversal and absolute paths are rejected", () => {
  for (const value of ["../secret", "company/../../secret", "/etc/passwd", "company\\secret", "x\0y"]) assert.throws(() => beneath(UPLOAD_ROOT, value));
  assert.throws(() => storedPath("/uploads/../server.js"));
  assert.throws(() => storedPath("/server.js"));
});
test("oversized and broken streams leave no partial files", async () => {
  const before = await fs.readdir(path.join(UPLOAD_ROOT, directory));
  await assert.rejects(upload(file(Buffer.concat([png, Buffer.alloc(8 * 1024 * 1024)])), directory), error => error.statusCode === 413);
  const broken = { filename: "broken.png", mimetype: "image/png", createReadStream: () => Readable.from((async function* () { yield png; throw new Error("stream failed"); })()) };
  await assert.rejects(upload(broken, directory));
  assert.deepEqual(await fs.readdir(path.join(UPLOAD_ROOT, directory)), before);
});
test("symlinks cannot move upload writes or deletions outside storage", async () => {
  const link = path.join(UPLOAD_ROOT, directory, "outside");
  await fs.symlink(external, link, "dir");
  await fs.writeFile(path.join(external, "protected.png"), png);
  await assert.rejects(upload(file(png), `${directory}/outside`), error => error.statusCode === 400);
  await assert.rejects(deleteImageFromStorage(`/uploads/${directory}/outside/protected.png`), error => error.statusCode === 400);
  assert.deepEqual(await fs.readFile(path.join(external, "protected.png")), png);
});
