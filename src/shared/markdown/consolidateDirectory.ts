import { findMarkdownFiles } from "@shared/file-utils/findMarkdownFiles";
import * as fs from "fs";
import * as path from "path";
import { combineMarkdownFiles } from "./combineMarkdownFiles";

/**
 * Parameters for consolidating a directory of markdown files
 */
export type ConsolidateDirectoryParams = {
  /**
   * The directory containing source markdown files
   */
  sourceDir: string;

  /**
   * The name of the output markdown file
   */
  targetFile: string;

  /**
   * The destination directory for consolidated files
   */
  sectionsDir: string;
};

/**
 * Generates a consolidated markdown file from a source documentation directory.
 *
 * @param params - Parameters for directory consolidation
 *
 * @description Processes markdown files in a source directory,
 * combines them into a single comprehensive document,
 * and saves the result in a specified sections directory.
 */
export function consolidateDirectory(params: ConsolidateDirectoryParams): void {
  const { sourceDir, targetFile, sectionsDir } = params;

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    return;
  }

  const files = findMarkdownFiles(sourceDir);

  if (files.length === 0) {
    console.warn(`No markdown files found in directory: ${sourceDir}`);
    return;
  }

  // Create title from the target file name (capitalized, without dashes)
  const title = path
    .basename(targetFile, ".md")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const combinedContent = `# ${title}\n\n` + combineMarkdownFiles(files);
  const targetPath = path.join(sectionsDir, targetFile);

  fs.writeFileSync(targetPath, combinedContent);
  console.log(
    `Created consolidated file: ${targetPath} from ${files.length} markdown files`
  );
}
