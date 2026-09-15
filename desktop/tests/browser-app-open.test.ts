import assert from "node:assert/strict";
import { test } from "node:test";
import { launchOpenRequests } from "../src/main/app-open.ts";

test("Windows launch arguments accept registered web URLs and associated documents", () => {
  const requests = launchOpenRequests([
    "C:\\Program Files\\Zenmium\\Zenmium.exe",
    "--original-process-start-time=123",
    "https://example.com/a?source=shell",
    "C:\\Users\\Avery\\Documents\\brief.HTML",
    "C:\\Users\\Avery\\Documents\\report.pdf",
  ], "win32");

  assert.deepEqual(requests, [
    { kind: "url", url: "https://example.com/a?source=shell" },
    { kind: "file", path: "C:\\Users\\Avery\\Documents\\brief.HTML" },
    { kind: "file", path: "C:\\Users\\Avery\\Documents\\report.pdf" },
  ]);
});

test("launch parsing ignores unsafe URLs and files that are not registered associations", () => {
  const requests = launchOpenRequests([
    "javascript:alert(1)",
    "https://user:password@example.com/",
    "file:///C:/Users/Avery/Documents/brief.html",
    "brief.html",
    "C:\\Users\\Avery\\Documents\\notes.txt",
    "C:\\Users\\Avery\\Documents\\nul\u0000.pdf",
  ], "win32");

  assert.deepEqual(requests, []);
});

test("non-Windows launch arguments do not replace macOS file-open events", () => {
  const requests = launchOpenRequests([
    "/Users/avery/Documents/brief.html",
    "https://example.com/",
  ], "darwin");

  assert.deepEqual(requests, [{ kind: "url", url: "https://example.com/" }]);
});
