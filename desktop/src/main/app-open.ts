import { extname, win32 } from "node:path";

export type LaunchOpenRequest =
  | { kind: "url"; url: string }
  | { kind: "file"; path: string };

const OPENABLE_FILE_EXTENSIONS = new Set([".htm", ".html", ".pdf", ".xhtml"]);

// This mirrors browser-url.ts. Keep argv parsing independent from Electron and
// from bundler-specific TypeScript resolution so it remains directly testable.
function shellWebUrl(input: string): string | null {
  if (input.length > 16_384 || /[\u0000-\u001f\u007f]/.test(input)) return null;
  try {
    const url = new URL(input);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/**
 * Extract OS shell-open requests from Electron's launch arguments.
 *
 * Electron emits `open-file` and `open-url` on macOS. Windows delivers the
 * same first-instance requests through argv, including when the executable is
 * launched from a file association. Keep this parser side-effect free so the
 * main process can queue the result before its first window is ready.
 */
export function launchOpenRequests(
  argv: readonly string[],
  platform = process.platform,
): LaunchOpenRequest[] {
  const requests: LaunchOpenRequest[] = [];

  for (const argument of argv) {
    const url = shellWebUrl(argument);
    if (url) {
      requests.push({ kind: "url", url });
      continue;
    }

    // On Windows, file associations supply an absolute filesystem path. Do
    // not resolve relative arguments or accept arbitrary extensions here.
    // ArcCore performs the final realpath and regular-file validation before
    // it creates a file tab.
    if (
      platform === "win32" &&
      argument.length <= 32_767 &&
      !/[\u0000-\u001f\u007f]/.test(argument) &&
      win32.isAbsolute(argument) &&
      OPENABLE_FILE_EXTENSIONS.has(extname(argument).toLocaleLowerCase())
    ) {
      requests.push({ kind: "file", path: argument });
    }
  }

  return requests;
}
