import { generateAiFriendlyAngularDocs } from "@features/angular-docs/generateAiFriendlyAngularDocs";
import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import { findMarkdownFiles } from "@shared/file-utils/findMarkdownFiles";
import { cloneRepository } from "@shared/github/cloneRepository";
import { getLatestStableRelease, getLatestAnyRelease } from "@shared/github/getLatestRelease";
import { createCollectionFromMarkdownFiles } from "@shared/llamaindex/createCollectionFromMarkdownFiles";
import { Settings } from "llamaindex";

/**
 * Enhanced Angular documentation generation script with version selection options.
 * Supports latest stable, latest any (including prereleases), or specific version.
 *
 * Usage:
 * - No arguments: Uses latest stable release
 * - --latest: Uses latest stable release (same as no arguments)
 * - --latest-any: Uses latest release (including prereleases)
 * - --version=X.X.X: Uses specific version
 */
async function main() {
  try {
    let version: string;
    const args = process.argv.slice(2);
    
    // Parse command line arguments
    if (args.includes('--latest-any')) {
      console.log("Fetching latest Angular release (including prereleases)...");
      version = await getLatestAnyRelease("angular", "angular");
    } else {
      const versionArg = args.find(arg => arg.startsWith('--version='));
      if (versionArg) {
        version = versionArg.split('=')[1];
        console.log(`Using specified Angular version: ${version}`);
      } else {
        console.log("Fetching latest stable Angular release...");
        version = await getLatestStableRelease("angular", "angular");
      }
    }
    
    console.log(`Processing Angular version: ${version}`);
    
    /** Repository directory */
    const repoDir = `./cloned-repos/angular-${version}`;
    /** Source directory containing original Angular documentation */
    const sourceDir = `${repoDir}/adev/src/content`;
    /** Target directory where AI-friendly documentation will be written */
    const targetDir = `./ai-friendly-docs/angular-${version}`;

    // Clone the Angular repository with the specified version
    await cloneRepository({
      owner: "angular",
      repo: "angular",
      version: version,
      targetDir: repoDir,
      depth: 1,
    });
    
    await generateAiFriendlyAngularDocs({
      sourceDir,
      targetDir,
    });
    console.log(
      "AI-friendly Angular documentation generation completed successfully!"
    );

    // Configure embedding model for vector generation
    Settings.embedModel = new HuggingFaceEmbedding({
      modelType: "Xenova/all-MiniLM-L6-v2",
    });

    // Create vector embeddings and store in Qdrant collection
    await createCollectionFromMarkdownFiles(
      `angular-${version}`,
      findMarkdownFiles(`./ai-friendly-docs/angular-${version}/sections`)
    );
    console.log(
      `AI-friendly Angular documentation Qdrant collection (angular-${version}) generation completed successfully!`
    );
    process.exit(0);
  } catch (error) {
    console.error(
      "Error during AI-friendly Angular documentation generation:",
      error
    );
    process.exit(1);
  }
}

// Execute the documentation generation process
main();