import * as fs from "fs";
import * as path from "path";

/**
 * Parameters for generating a single documentation file
 */
export type GenerateSingleDocFileParams = {
  /**
   * Array of markdown files to be consolidated
   */
  sectionFiles: string[];
  
  /**
   * Directory containing the section markdown files
   */
  sectionsDir: string;
  
  /**
   * Destination path for the comprehensive documentation file
   */
  outputPath: string;
};

/**
 * Creates a comprehensive single documentation file from multiple section files.
 * 
 * @param params - Parameters for single doc file generation
 * 
 * @description Aggregates multiple documentation sections into a unified, 
 * hierarchically structured markdown document, providing a complete overview 
 * of the project's documentation.
 */
export function generateSingleDocFile(
  params: GenerateSingleDocFileParams
): void {
  const { sectionFiles, sectionsDir, outputPath } = params;
  console.log("Generating single comprehensive Angular documentation file...");

  // Make sure parent directory exists
  const parentDir = path.dirname(outputPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Create title and intro
  let content = "# Angular Complete Documentation\n\n";
  content +=
    "This is a comprehensive collection of Angular documentation consolidated into a single file for easier reference.\n\n";

  // Loop through all section files and append their content
  for (const sectionFile of sectionFiles) {
    console.log(
      `Processing ${sectionFile} for inclusion in single doc file...`
    );
    const sectionContent = fs.readFileSync(
      path.join(sectionsDir, sectionFile),
      "utf-8"
    );

    // Get the first line that should contain the title
    const titleMatch = sectionContent.match(/^# (.+)$/m);
    const sectionTitle = titleMatch
      ? titleMatch[1]
      : path.basename(sectionFile, ".md");

    // Add section divider and title as H2
    content += "\n\n---\n\n";
    content += `## ${sectionTitle}\n\n`;

    // Add the rest of the content, removing the first title line
    let cleanedContent = sectionContent.replace(/^# .+$/m, "");

    // Increase heading level for all headings in the content (# -> ##, ## -> ###, etc.)
    cleanedContent = cleanedContent.replace(/^(#{1,5}) /gm, "#$1 ");

    content += cleanedContent.trim();
  }

  // Write the single file
  fs.writeFileSync(outputPath, content);
  console.log(`Created single documentation file: ${outputPath}`);
}
