import * as fs from "fs";
import * as path from "path";

/**
 * Consolidates multiple markdown files into a single, structured document.
 * 
 * @param files - An array of absolute file paths to markdown files
 * @returns A single markdown string combining all input files
 * 
 * @description Merges markdown files with consistent formatting, 
 * adjusts heading hierarchies, and adds file metadata to create 
 * a comprehensive documentation compilation.
 */
export function combineMarkdownFiles(files: string[]): string {
  // Sort files to ensure consistent order
  files.sort();

  let combinedContent = "";

  for (const file of files) {
    const fileName = path.basename(file);
    let content = fs.readFileSync(file, "utf-8");

    // Increase heading levels by one (# -> ##, ## -> ###, etc.)
    content = content.replace(/^(#{1,5}) /gm, "#$1 ");

    // Add file name as a heading, and include the content
    combinedContent += `\n\n(From ${fileName})\n\n`;
    combinedContent += content.trim();
    combinedContent += "\n\n---\n";
  }

  return combinedContent.trim();
}
