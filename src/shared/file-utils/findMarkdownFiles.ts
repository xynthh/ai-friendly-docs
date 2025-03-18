import * as fs from "fs";
import * as path from "path";

/**
 * Recursively discovers all markdown files within a given directory.
 * 
 * @param dirPath - The root directory to start searching for markdown files
 * @returns An array of absolute file paths for all discovered markdown files
 * 
 * @description Traverses through directory structures to collect all markdown files,
 * ensuring comprehensive file discovery across nested directories.
 */
export function findMarkdownFiles(dirPath: string): string[] {
  const results: string[] = [];
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      // Recursively search subdirectories
      results.push(...findMarkdownFiles(fullPath));
    } else if (item.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}
