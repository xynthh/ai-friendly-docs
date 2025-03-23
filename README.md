# AI-Friendly Documentation Project

This repository contains AI-optimized documentation for various open source projects. The goal is to provide documentation in a format that is easily consumable by Large Language Models (LLMs).

#### Using the Generated Documentation

The AI-friendly documentation can be used in several ways:

1. **Direct Consumption by LLMs**: The markdown files can be directly fed to LLMs to improve their understanding of Angular concepts

2. **RAG Integration**: The vector embeddings can be used in RAG systems to enhance LLM responses with accurate Angular documentation

3. **Training Data**: The processed documentation can serve as high-quality training data for future AI models

For more insights on improving LLM responses with AI-friendly documentation, see my article: ["Getting Better LLM Responses Using AI-Friendly Documentation"](https://www.aiboosted.dev/p/getting-better-llm-responses-using-ai-friendly-docs)

## Angular 19.2.3

The Angular documentation is derived from the official source at [Angular GitHub Repository](https://github.com/angular/angular/tree/main/adev/src/content).

- Complete Angular documentation in a [single file](ai-friendly-docs/angular-19.2.3/angular-full.md), [table of contents](ai-friendly-docs/angular-19.2.3/toc.md)
- [Individual documentation files](ai-friendly-docs/angular-19.2.3/sections) for specific Angular features

### Scripts

The `angular.ts` script is responsible for generating AI-friendly Angular documentation from the official Angular source files. It performs three main operations:

1. **Repository Cloning**: Automatically clones the specific version of the Angular repository from GitHub into a local directory.

2. **Documentation Generation**: Transforms the original Angular documentation into formats optimized for AI consumption.

3. **Vector Embedding Creation**: Creates vector embeddings of the transformed documentation using HuggingFace's embedding models. These embeddings are stored in a local Qdrant vector database (running at localhost:6333), making them readily available for semantic search and retrieval.

#### Output Files

The script generates:

- A comprehensive markdown file containing all Angular documentation
- Individual markdown files for specific Angular features in the `sections` directory
- A table of contents file
- Vector embeddings for search and retrieval

#### Vector Storage

The vector embeddings are stored in a Qdrant vector database with the following setup:

- **Server**: Local Qdrant instance running at `http://localhost:6333`
- **Collection Naming**: Each documentation set gets its own collection (e.g., `angular-19.2.3`)
- **Model**: Uses `Xenova/all-MiniLM-L6-v2` for generating embeddings
- **Chunking**: Documentation is intelligently chunked using a LlamaIndex.TS's Markdown-aware parser that preserves document structure

#### Directory Structure

The script maintains the following directory structure:

```
./
├── cloned-repos/               # Repository storage location
│   └── angular-{version}/      # Cloned Angular repository
├── ai-friendly-docs/           # Generated documentation output
│   └── angular-{version}/      # Version-specific documentation
│       ├── angular-full.md     # Complete documentation in one file
│       ├── toc.md              # Table of contents
│       └── sections/           # Individual documentation files
```

To use the generated embeddings in your own applications:

1. Ensure Qdrant is running locally: `docker run -p 6333:6333 qdrant/qdrant`
2. Connect to the appropriate collection name corresponding to the documentation version
3. Perform semantic searches against the indexed content

```typescript
// Example code for querying the vector store
import { QdrantVectorStore } from "@llamaindex/qdrant";
import { VectorStoreIndex } from "llamaindex";

// Connect to the existing collection
const vectorStore = new QdrantVectorStore({
  url: "http://localhost:6333",
  collectionName: "angular-19.2.3",
});

// Create an index from the existing collection
const index = await VectorStoreIndex.fromVectorStore(vectorStore);
const retriever = index.asRetriever({
  similarityTopK: 3,
});

// Query the documentation
const nodesWithScore = await retriever.retrieve({
  query: "Are standalone components default in Angular?",
});

console.log(nodesWithScore);
```

To run the script:

```
pnpm run generate:angular
```

## Future Additions

More open source projects will be added to this collection in the future.
