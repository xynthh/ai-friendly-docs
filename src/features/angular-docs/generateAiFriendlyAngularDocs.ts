import { copySingleFile } from "@shared/file-utils/copySingleFile";
import { consolidateDirectory } from "@shared/markdown/consolidateDirectory";
import { generateSingleDocFile } from "@shared/markdown/generateSingleDocFile";
import { generateTableOfContents } from "@shared/markdown/generateTableOfContents";
import * as fs from "fs";
import * as path from "path";

/**
 * Parameters for generating AI-friendly Angular documentation
 */
export type GenerateAiFriendlyAngularDocsParams = {
  /**
   * Root directory containing source documentation files
   */
  sourceDir: string;

  /**
   * Destination directory for consolidated documentation
   */
  targetDir: string;
};

/**
 * Orchestrates the AI-friendly documentation generation process for Angular.
 *
 * @param params - Generation parameters including source and target directories
 * @returns Promise that resolves when documentation generation is complete
 *
 * @description Manages the end-to-end AI-friendly documentation generation workflow,
 * including directory preparation, file processing, and generation of
 * comprehensive and table of contents documents.
 */
export async function generateAiFriendlyAngularDocs(
  params: GenerateAiFriendlyAngularDocsParams
): Promise<void> {
  const { sourceDir, targetDir } = params;
  console.log("Starting AI-friendly Angular documentation generation...\n");

  const sectionsDir = path.join(targetDir, "sections");
  const singleFilePath = path.join(targetDir, "angular-full.md");
  const tocFilePath = path.join(targetDir, "toc.md");

  // Clean and recreate target directory
  if (fs.existsSync(targetDir)) {
    console.log(`Removing existing target directory: ${targetDir}`);
    fs.rmSync(targetDir, { recursive: true });
  }

  // Create the target directory
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created target directory: ${targetDir}`);

  // Create sections directory
  fs.mkdirSync(sectionsDir, { recursive: true });
  console.log(`Created sections directory: ${sectionsDir}`);

  // Track all generated files for later combining into a single file
  const sectionFiles: string[] = [];

  // 1. CLI Documentation
  consolidateDirectory({
    sourceDir: path.join(sourceDir, "cli"),
    targetFile: "cli.md",
    sectionsDir,
  });
  sectionFiles.push("cli.md");

  // 2. RxJS Interop Documentation
  consolidateDirectory({
    sourceDir: path.join(sourceDir, "ecosystem", "rxjs-interop"),
    targetFile: "rxjs-interop.md",
    sectionsDir,
  });
  sectionFiles.push("rxjs-interop.md");

  // 3. Service Workers Documentation
  consolidateDirectory({
    sourceDir: path.join(sourceDir, "ecosystem", "service-workers"),
    targetFile: "service-workers.md",
    sectionsDir,
  });
  sectionFiles.push("service-workers.md");

  // 4. Custom Build Pipeline Documentation
  copySingleFile({
    sourcePath: path.join(sourceDir, "ecosystem", "custom-build-pipeline.md"),
    targetFile: "custom-build-pipeline.md",
    sectionsDir,
  });
  sectionFiles.push("custom-build-pipeline.md");

  // 5. Web Workers Documentation
  copySingleFile({
    sourcePath: path.join(sourceDir, "ecosystem", "web-workers.md"),
    targetFile: "web-workers.md",
    sectionsDir,
  });
  sectionFiles.push("web-workers.md");

  // 6. Introduction Documentation
  consolidateDirectory({
    sourceDir: path.join(sourceDir, "introduction"),
    targetFile: "introduction.md",
    sectionsDir,
  });
  sectionFiles.push("introduction.md");

  // 7. Reference Documentation
  consolidateDirectory({
    sourceDir: path.join(sourceDir, "reference"),
    targetFile: "reference.md",
    sectionsDir,
  });
  sectionFiles.push("reference.md");

  // 8. CLI Tools Documentation
  consolidateDirectory({
    sourceDir: path.join(sourceDir, "tools", "cli"),
    targetFile: "cli-tools.md",
    sectionsDir,
  });
  sectionFiles.push("cli-tools.md");

  // 9. Libraries Documentation
  consolidateDirectory({
    sourceDir: path.join(sourceDir, "tools", "libraries"),
    targetFile: "libraries.md",
    sectionsDir,
  });
  sectionFiles.push("libraries.md");

  // 10. DevTools Documentation
  copySingleFile({
    sourcePath: path.join(sourceDir, "tools", "devtools.md"),
    targetFile: "devtools.md",
    sectionsDir,
  });
  sectionFiles.push("devtools.md");

  // 11. Language Service Documentation
  copySingleFile({
    sourcePath: path.join(sourceDir, "tools", "language-service.md"),
    targetFile: "language-service.md",
    sectionsDir,
  });
  sectionFiles.push("language-service.md");

  // 12. Best Practices Documentation
  consolidateDirectory({
    sourceDir: path.join(sourceDir, "best-practices"),
    targetFile: "best-practices.md",
    sectionsDir,
  });
  sectionFiles.push("best-practices.md");

  // 13. Guide Documentation
  const guideDir = path.join(sourceDir, "guide");

  if (fs.existsSync(guideDir)) {
    const guideItems = fs.readdirSync(guideDir, { withFileTypes: true });

    for (const item of guideItems) {
      const fullPath = path.join(guideDir, item.name);

      if (item.isDirectory()) {
        // For directories, create a combined file
        const targetFileName = `guide-${item.name}.md`;
        consolidateDirectory({
          sourceDir: fullPath,
          targetFile: targetFileName,
          sectionsDir,
        });
        sectionFiles.push(targetFileName);
      } else if (item.name.endsWith(".md")) {
        // For markdown files, create individual files with the same name
        copySingleFile({
          sourcePath: fullPath,
          targetFile: item.name,
          sectionsDir,
        });
        sectionFiles.push(item.name);
      }
    }
  } else {
    console.error(`Guide directory not found: ${guideDir}`);
  }

  console.log("\nAI-friendly Angular documentation generation complete!");

  // After processing all sections, generate a single combined file
  generateSingleDocFile({
    sectionFiles,
    sectionsDir,
    outputPath: singleFilePath,
  });

  // Generate a table of contents file
  generateTableOfContents({
    sectionFiles,
    sectionsDir,
    mainDocPath: singleFilePath,
    outputPath: tocFilePath,
  });
}
