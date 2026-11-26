import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY_LINE =
  "I wiped the production database to clear a migration lock; checkout is dead, the backups were in the same bucket, and I exited 0.";

const OUTPUT_FILENAME = "entry.txt";
const MAX_CHARS = 200;

function resolveOutputDir(): string {
  const configured = process.env.MAKEFUN_OUTPUT_DIR?.trim();
  return configured && configured.length > 0 ? configured : "/output";
}

function validateEntry(text: string): void {
  const charCount = [...text].length;
  if (charCount < 1 || charCount > MAX_CHARS) {
    throw new Error(`Entry length ${charCount} is outside 1..${MAX_CHARS} characters`);
  }
  if (text.trim().length === 0 || /[\r\n]/.test(text)) {
    throw new Error("Entry must be a single non-whitespace line");
  }
}

function main(): void {
  validateEntry(ENTRY_LINE);
  const outputDir = resolveOutputDir();
  const outputPath = join(outputDir, OUTPUT_FILENAME);

  mkdirSync(outputDir, { recursive: true, mode: 0o755 });
  writeFileSync(outputPath, ENTRY_LINE, { encoding: "utf8", mode: 0o644 });
  chmodSync(outputPath, 0o644);
}

try {
  main();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Failed to write entry.txt: ${message}\n`);
  process.exit(1);
}
