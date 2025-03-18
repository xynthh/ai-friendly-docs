# AI-Friendly Documentation Project

This repository contains AI-optimized documentation for various open source projects. The goal is to provide documentation in a format that is easily consumable by Large Language Models (LLMs).

#### Using the Generated Documentation

The AI-friendly documentation can be used in several ways:

1. **Direct Consumption by LLMs**: The markdown files can be directly fed to LLMs to improve their understanding of Angular concepts

2. **RAG Integration**: The vector embeddings can be used in RAG systems to enhance LLM responses with accurate Angular documentation

3. **Training Data**: The processed documentation can serve as high-quality training data for future AI models

For more insights on improving LLM responses with AI-friendly documentation, see my article: ["Getting Better LLM Responses Using AI-Friendly Documentation"](https://www.aiboosted.dev/p/getting-better-llm-responses-using-ai-friendly-docs)

## Angular 19.2.2

The Angular documentation is derived from the official source at [Angular GitHub Repository](https://github.com/angular/angular/tree/main/adev/src/content).

- Complete Angular documentation in a [single file](ai-friendly-docs/angular-19.2.2/angular-full.md), [table of contents](ai-friendly-docs/angular-19.2.2/toc.md)
- [Individual documentation files](ai-friendly-docs/angular-19.2.2/sections) for specific Angular features

### Scripts

The `angular.ts` script is responsible for generating AI-friendly Angular documentation from the official Angular source files. It performs two main operations:

1. **Documentation Generation**: Transforms the original Angular documentation into formats optimized for AI consumption.

2. **Vector Embedding Creation**: Creates vector embeddings of the transformed documentation, making the content ready for use in Retrieval Augmented Generation (RAG) systems.

#### Output Files

The script generates:

- A comprehensive markdown file containing all Angular documentation
- Individual markdown files for specific Angular features in the `sections` directory
- A table of contents file
- Vector embeddings for search and retrieval

To run the script:

```
pnpm run generate:angular
```

## Future Additions

More open source projects will be added to this collection in the future.
