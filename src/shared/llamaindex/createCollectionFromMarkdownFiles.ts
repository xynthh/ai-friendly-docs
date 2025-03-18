import { QdrantVectorStore } from "@llamaindex/qdrant";
import fs from "fs";
import {
  Document,
  MarkdownNodeParser,
  VectorStoreIndex,
  type Metadata,
  type TextNode,
} from "llamaindex";
import path from "path";

/**
 * Creates a collection from markdown files
 * @param collectionName - Name for the collection
 * @param files - Array of file paths to read and process
 * @returns The created vector index
 */
export async function createCollectionFromMarkdownFiles(
  collectionName: string,
  files: string[]
) {
  // Initialize parser and empty documents array
  const markdownNodeParser = new MarkdownNodeParser();
  let allNodes: TextNode<Metadata>[] = [];

  // Process each file in the files array
  for (const filePath of files) {
    try {
      const text = fs.readFileSync(filePath, "utf-8");
      const fileName = path.basename(filePath);

      // Create document with metadata
      const document = new Document({
        text,
        metadata: {
          originalFile: fileName,
        },
      });

      // Parse document into nodes and add to collection
      const nodes = markdownNodeParser([document]);
      allNodes = [...allNodes, ...nodes];
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }

  // Initialize vector store with the collection name
  const vectorStore = new QdrantVectorStore({
    url: "http://localhost:6333",
    collectionName,
  });

  // Create and return the index from all collected nodes
  const index = await VectorStoreIndex.fromDocuments(allNodes, {
    vectorStores: { TEXT: vectorStore },
  });

  return index;
}
