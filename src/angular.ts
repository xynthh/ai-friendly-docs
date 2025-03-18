import { generateAiFriendlyAngularDocs } from "@features/angular-docs/generateAiFriendlyAngularDocs";
import { HuggingFaceEmbedding } from "@llamaindex/huggingface";
import { findMarkdownFiles } from "@shared/file-utils/findMarkdownFiles";
import { createCollectionFromMarkdownFiles } from "@shared/llamaindex/createCollectionFromMarkdownFiles";
import { Settings } from "llamaindex";

/**
 * Main entry point for the AI-friendly Angular documentation generation script.
 * Creates documentation and vector embeddings for Angular framework.
 *
 * @remarks
 * This script performs two main operations:
 * 1. Generates AI-friendly documentation from Angular source files
 * 2. Creates vector embeddings and stores them in a Qdrant collection
 *
 * Uses default configuration settings defined in the feature.
 *
 * @returns Promise that resolves when the process completes
 * @throws Error if documentation generation or embedding creation fails
 * @see generateAiFriendlyAngularDocs for the main transformation logic
 * @see createCollectionFromMarkdownFiles for the embedding process
 */
async function main() {
  /** Angular version to process */
  const version = "19.2.2";
  /** Source directory containing original Angular documentation */
  const sourceDir = `./cloned-repos/angular-${version}/adev/src/content`;
  /** Target directory where AI-friendly documentation will be written */
  const targetDir = `./ai-friendly-docs/angular-${version}`;
  try {
    await generateAiFriendlyAngularDocs({
      sourceDir,
      targetDir,
    });
    console.log(
      "AI-friendly Angular documentation generation completed successfully!"
    );

    // Configure embedding model for vector generation
    Settings.embedModel = new HuggingFaceEmbedding({
      // modelType: "Xenova/multilingual-e5-small", // 128M
      modelType: "onnx-community/gte-multilingual-base", // 305M
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
// This is the entry point for the script
main();
