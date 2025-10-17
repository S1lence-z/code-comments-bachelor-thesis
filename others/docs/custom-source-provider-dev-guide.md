# Custom Source Provider Implementation Guide

## Overview

The application supports pluggable source providers, allowing you to integrate code from various sources beyond GitHub. This document explains how to implement a custom source provider.

## What is a Source Provider?

A source provider is responsible for:

1. **Fetching the repository tree** - Providing the complete directory structure of files
2. **Fetching individual files** - Retrieving and processing file contents

## Architecture

### Core Interface: `ISourceProvider`

All source providers must implement the `ISourceProvider` interface located at:

```
client/src/types/sourceProviders/ISourceProvider.ts
```

```typescript
export interface ISourceProvider {
	getRepositoryTree(repositoryUrl: string, branch: string, authToken?: string): Promise<TreeNode[]>;

	fetchProcessedFile(
		repositoryUrl: string,
		branch: string,
		filePath: string,
		authToken?: string
	): Promise<ProcessedFile>;
}
```

### Data Types

#### TreeNode

Represents a file or folder in the directory structure:

```typescript
export interface TreeNode {
	name: string; // File or folder name
	path: string; // Relative path from repository root
	type: TreeNodeType; // "file" | "folder"
	children: TreeNode[]; // Child nodes (for folders)
	isExpanded: boolean; // UI state for folder expansion
}
```

#### ProcessedFile

Represents a processed file with its content and metadata:

```typescript
export interface ProcessedFile {
	displayType: FileDisplayType; // "text" | "image" | "pdf" | "binary"
	content: string | null; // Text content (for text files)
	downloadUrl: string | null; // URL to download the file
	previewUrl: string | null; // URL for previewing (images, PDFs)
	fileName: string; // Name of the file
}
```

## Implementing a Custom HTTP API Provider

### HTTP API Requirements

Your HTTP API must provide two endpoints:

#### 1. Repository Tree Endpoint

**GET** `{baseUrl}/tree?branch={branch}`

**Response:** JSON array of `TreeNode` objects representing the complete directory structure.

**Example Response:**

```json
[
	{
		"name": "src",
		"path": "src",
		"type": "folder",
		"children": [
			{
				"name": "main.ts",
				"path": "src/main.ts",
				"type": "file",
				"children": [],
				"isExpanded": false
			}
		],
		"isExpanded": true
	},
	{
		"name": "README.md",
		"path": "README.md",
		"type": "file",
		"children": [],
		"isExpanded": false
	}
]
```

#### 2. File Content Endpoint

**GET** `{baseUrl}/file?branch={branch}&path={filePath}`

**Response:** JSON object conforming to the `ProcessedFile` interface.

**Example Response:**

```json
{
	"displayType": "text",
	"content": "import { createApp } from 'vue';\n...",
	"downloadUrl": "https://example.com/download/main.ts",
	"previewUrl": null,
	"fileName": "main.ts"
}
```

### Authentication

Both endpoints should accept an optional `Authorization` header:

```
Authorization: Bearer {token}
```

### Implementation Example

The `HttpApiSourceProvider` is already implemented in:

```
client/src/services/providers/HttpApiSourceProvider.ts
```

You can use this as a reference implementation.

## Creating a New Provider Type

To add a completely new provider type (e.g., for Bitbucket, GitLab, or a custom VCS):

### Step 1: Update the RepositoryType Enum

Add your new type to both client and manager:

**Client:** `client/src/types/enums/RepositoryType.ts`
**Manager:** `manager/shared/types/RepositoryType.ts`

```typescript
export enum RepositoryType {
	git = "git",
	httpApi = "httpApi",
	myCustomProvider = "myCustomProvider", // Add this
}
```

### Step 2: Create Your Provider Class

Create a new file in `client/src/services/providers/`:

```typescript
// MyCustomSourceProvider.ts
import type { ISourceProvider } from "../../types/sourceProviders/ISourceProvider";
import type { TreeNode } from "../../types/github/githubTree";
import type { ProcessedFile } from "../../types/github/githubFile";

export class MyCustomSourceProvider implements ISourceProvider {
	async getRepositoryTree(repositoryUrl: string, branch: string, authToken?: string): Promise<TreeNode[]> {
		// Your implementation here
		// Fetch tree data from your source
		// Transform it to TreeNode[]
		// Return the tree
	}

	async fetchProcessedFile(
		repositoryUrl: string,
		branch: string,
		filePath: string,
		authToken?: string
	): Promise<ProcessedFile> {
		// Your implementation here
		// Fetch file content from your source
		// Determine the displayType
		// Process content appropriately
		// Return ProcessedFile
	}
}
```

### Step 3: Register in the Provider Factory

Update `client/src/services/sourceProviderFactory.ts`:

```typescript
import { MyCustomSourceProvider } from "./providers/MyCustomSourceProvider";

const createProvider = (repositoryType: RepositoryType): ISourceProvider => {
	switch (repositoryType) {
		case RepositoryType.git:
			return new GithubSourceProvider();
		case RepositoryType.httpApi:
			return new HttpApiSourceProvider();
		case RepositoryType.myCustomProvider: // Add this
			return new MyCustomSourceProvider();
		default:
			throw new Error(`Unsupported repository type: ${repositoryType}`);
	}
};
```

### Step 4: Update the Manager UI

Add your provider to the UI selector in `manager/app/components/ProjectForm.vue`:

```typescript
const repositoryTypeOptions = [
	{ value: RepositoryType.git, label: "GitHub", icon: "mdi:github" },
	{ value: RepositoryType.httpApi, label: "HTTP API", icon: "mdi:api" },
	{ value: RepositoryType.myCustomProvider, label: "My Provider", icon: "mdi:cloud" },
];
```

### Step 5: Add Translations

Update `manager/i18n/locales/en.json`:

```json
{
	"projectForm": {
		"myCustomProviderUrlPlaceholder": "Enter your custom provider URL"
	}
}
```

## Testing Your Provider

1. **Unit Tests**: Write tests for your provider methods
2. **Integration Testing**:
    - Create a test project with your provider type
    - Verify the file tree loads correctly
    - Open files and ensure content displays properly
    - Test commenting functionality

## File Processing Guidelines

### Text Files

-   Set `displayType: FileDisplayType.Text`
-   Decode content to UTF-8 string
-   Set `content` property with the text
-   Set `previewUrl: null`

### Images (JPG, PNG)

-   Set `displayType: FileDisplayType.Image`
-   Set `previewUrl` to a publicly accessible image URL
-   Set `content: null`

### PDFs

-   Set `displayType: FileDisplayType.PDF`
-   Set `previewUrl` to a publicly accessible PDF URL or blob URL
-   Set `content: null`

### Binary Files

-   Set `displayType: FileDisplayType.Binary`
-   Set `content: null`
-   Set `previewUrl: null`
-   Provide `downloadUrl` if possible

## Best Practices

1. **Error Handling**: Always throw descriptive errors
2. **Validation**: Validate inputs before making API calls
3. **Performance**: Consider caching strategies for large repositories
4. **Security**: Never expose authentication tokens in logs or error messages
5. **Type Safety**: Leverage TypeScript's type system for robust implementations

## Troubleshooting

### Common Issues

**Problem**: Tree doesn't display

-   Verify your `TreeNode` structure matches the interface exactly
-   Ensure `type` is either "file" or "folder"
-   Check that paths are relative from repository root

**Problem**: Files don't open

-   Confirm `ProcessedFile.displayType` is set correctly
-   For text files, ensure `content` is a valid UTF-8 string
-   For media files, verify `previewUrl` or `downloadUrl` is accessible

**Problem**: Authentication fails

-   Check that the `Authorization` header is formatted correctly
-   Verify the token is being passed through all layers

## Alternative: Single File Source

An alternative approach mentioned in requirements is a "single file source of truth" that provides the whole directory structure. This could be implemented as:

1. A JSON file containing both the tree structure and all file contents
2. Loaded once and cached in memory
3. Useful for small projects or demos

**Implementation**: Create a `JsonSourceProvider` that loads a single JSON file structured as:

```json
{
	"tree": [
		/* TreeNode array */
	],
	"files": {
		"path/to/file1.ts": {
			/* ProcessedFile */
		},
		"path/to/file2.ts": {
			/* ProcessedFile */
		}
	}
}
```

This approach minimizes network requests but increases initial load time.

## Support

For questions or issues:

-   Review existing providers: `GithubSourceProvider`, `HttpApiSourceProvider`
-   Check the interface definition: `ISourceProvider.ts`
-   Examine the factory implementation: `sourceProviderFactory.ts`
