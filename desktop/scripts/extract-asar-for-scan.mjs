import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { extractAll } from "@electron/asar";

const desktop = resolve(import.meta.dirname, "..");
const dist = resolve(desktop, "dist");
const [archiveArgument, outputArgument] = process.argv.slice(2);

function inside(root, candidate) {
  const part = relative(root, candidate);
  return part && part !== ".." && !part.startsWith("..\\") && !isAbsolute(part);
}

assert.ok(archiveArgument && outputArgument, "Usage: extract-asar-for-scan <archive> <output>");
const archive = resolve(desktop, archiveArgument);
const output = resolve(desktop, outputArgument);
assert.ok(archive.endsWith(".asar") && inside(dist, archive), "ASAR input must be inside dist");
assert.ok(inside(dist, output), "Extraction output must be a child of dist");

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });
extractAll(archive, output);
console.log(`Extracted ${relative(desktop, archive)} for secret scanning.`);
