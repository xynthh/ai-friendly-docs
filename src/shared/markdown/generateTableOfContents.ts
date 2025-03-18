import * as fs from "fs";
import * as path from "path";

/**
 * Parameters for generating a table of contents
 */
export type GenerateTableOfContentsParams = {
  /**
   * Array of markdown files representing documentation sections
   */
  sectionFiles: string[];
  
  /**
   * Directory containing the section markdown files
   */
  sectionsDir: string;
  
  /**
   * Path to the comprehensive documentation file
   */
  mainDocPath: string;
  
  /**
   * Destination path for the table of contents file
   */
  outputPath: string;
};

/**
 * Generates a structured table of contents for the consolidated documentation.
 * 
 * @param params - Parameters for table of contents generation
 * 
 * @description Creates a navigable index of documentation sections and subsections, 
 * providing a clear overview and easy navigation for the consolidated documentation.
 */
export function generateTableOfContents(
  params: GenerateTableOfContentsParams
): void {
  const { sectionFiles, sectionsDir, mainDocPath, outputPath } = params;
  console.log("Generating table of contents for Angular documentation...");

  // Make sure parent directory exists
  const parentDir = path.dirname(outputPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Start with a title
  let tocContent = "# Angular Documentation - Table of Contents\n\n";

  // Add main entry for the comprehensive file
  tocContent += `- [Complete Angular Documentation](${path.basename(
    mainDocPath
  )})\n`;

  // Add section for individual files
  tocContent += "\n## Documentation Sections\n\n";

  // Process each section file to extract its title and headings
  for (const sectionFile of sectionFiles) {
    const filePath = path.join(sectionsDir, sectionFile);
    if (!fs.existsSync(filePath)) {
      console.warn(`Section file not found: ${filePath}`);
      continue;
    }

    const sectionContent = fs.readFileSync(filePath, "utf-8");

    // Get the first heading as the section title
    const titleMatch = sectionContent.match(/^# (.+)$/m);
    const sectionTitle = titleMatch
      ? titleMatch[1]
      : path.basename(sectionFile, ".md");

    // Add section entry
    tocContent += `- [${sectionTitle}](sections/${sectionFile})\n`;

    // Extract all h2 headings (originally h1 in the source files)
    const h2Headings = sectionContent.match(/^## .+$/gm);

    if (h2Headings && h2Headings.length > 0) {
      // Add indented sub-entries
      h2Headings.forEach((heading) => {
        const headingText = heading.replace(/^## /, "");
        // If heading contains 'From ', it's a file marker rather than a real heading
        if (!headingText.startsWith("From ")) {
          const headingSlug = headingText
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s]+/g, "-");
          tocContent += `  - [${headingText}](sections/${sectionFile}#${headingSlug})\n`;
        }
      });
    }
  }

  // Write the TOC file
  fs.writeFileSync(outputPath, tocContent);
  console.log(`Created table of contents file: ${outputPath}`);
}
