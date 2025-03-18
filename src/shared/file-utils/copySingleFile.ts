import * as fs from "fs";
import * as path from "path";

/**
 * Parameters for copying a single markdown file
 */
export type CopySingleFileParams = {
  /**
   * The absolute path of the source markdown file
   */
  sourcePath: string;
  
  /**
   * The desired filename in the destination directory
   */
  targetFile: string;
  
  /**
   * The destination directory for the file
   */
  sectionsDir: string;
};

/**
 * Transfers a single markdown file to a designated sections directory.
 * 
 * @param params - Parameters for file copying
 * 
 * @description Copies a standalone markdown file to a centralized 
 * documentation sections directory, preserving its original content.
 */
export function copySingleFile(
  params: CopySingleFileParams
): void {
  const { sourcePath, targetFile, sectionsDir } = params;

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    return;
  }

  const content = fs.readFileSync(sourcePath, "utf-8");
  const targetPath = path.join(sectionsDir, targetFile);

  fs.writeFileSync(targetPath, content);
  console.log(`Copied file: ${targetPath}`);
}
