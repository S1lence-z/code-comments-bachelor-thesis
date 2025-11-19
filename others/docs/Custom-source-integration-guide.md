# Custom Repository Source - Developer/Admin Guide

The Code Comments application provides you with the flexibility to integrate custom source code repositories. This guide outlines the steps required to implement and integrate a custom source provider.

## Overview

By default, the application supports GitHub (using the GitHub API) and the Single File Source Provider. However, you can extend this functionality by implementing and integrating your own custom source provider.

There are two main integration options:

1. **Single File Source Provider**: Use the predefined provider with your custom static JSON file that contains repository structure and file content URLs
2. **New Provider Integration**: Implement a completely new source provider type like GitLab or Bitbucket

---

## Option 1: Single File Source Provider

The Single File Source Provider uses a single static JSON file containing:

-   Complete repository tree structure
-   URLs to individual file contents

This approach combines the simplicity of a static file with the scalability of on-demand file loading.

### Implementation Requirements

Your static JSON file should be accessible via HTTP/HTTPS at a URL you provide during project setup.

**Example URL format:** `https://your-server.com/projects/project-42/content.json`

### JSON File Structure

The `content.json` file must contain:

```json
{
  "tree": [
    {
      "name": "src",
      "path": "src",
      "type": "folder",
      "children": [
        {
          "name": "app.ts",
          "path": "src/app.ts",
          "type": "file",
          "fileUrl": "https://your-server.com/projects/project-42/files/src/app.ts",
          "children": [],
          "isExpanded": false
        },
        {
          "name": "logo.png",
          "path": "src/logo.png",
          "type": "file",
          "fileUrl": "https://your-server.com/projects/project-42/files/src/logo.png",
          "previewUrl": "https://your-server.com/projects/project-42/files/src/logo.png?preview=true",
          "children": [],
          "isExpanded": false
        }
      ],
      "isExpanded": false
    }
  ]
}
```

### Tree Node Structure

```typescript
interface TreeNode {
  name: string;           // File or folder name
  path: string;           // Relative path from repository root
  type: "file" | "folder"; // Node type
  fileUrl?: string;       // URL to fetch file content (required for files)
  previewUrl?: string;    // Optional optimized URL for preview (thumbnails, images, etc.)
  children: TreeNode[];   // Child nodes (empty array for files)
  isExpanded: boolean;    // UI state (default: false)
}
```

### File Content Response

When the application requests a file from the `fileUrl`, your server should return:

```json
{
  "displayType": "text",
  "content": "// Your file content here\nconst app = 'Hello';",
  "downloadUrl": "https://your-server.com/projects/project-42/files/src/app.ts",
  "previewUrl": null,
  "fileName": "app.ts"
}
```

#### ProcessedFile Interface

```typescript
interface ProcessedFile {
  displayType: "text" | "image" | "pdf" | "binary"; // How to display the file
  content: string | null;      // Text content (for text files, base64 for images)
  downloadUrl: string | null;  // URL to download full-size file
  previewUrl: string | null;   // URL for optimized preview (smaller images, PDF thumbnails)
  fileName: string;            // Name of the file
}
```

### downloadUrl vs previewUrl

-   **`downloadUrl`**: Points to the full-size file (e.g., 4K image, complete PDF document)
-   **`previewUrl`**: Points to an optimized version for preview purposes (e.g., 800px thumbnail, compressed PDF)

For text files, both URLs are typically the same or `previewUrl` can be `null`.

### Authentication

The initial request to `content.json` and subsequent file requests should support optional authentication via `Authorization` header:

```http
Authorization: Bearer {authToken}
```

### Error Handling

Your server should return appropriate HTTP status codes:

| Status Code                 | Meaning                       | Client Behavior                |
| --------------------------- | ----------------------------- | ------------------------------ |
| `200 OK`                    | Success                       | Process the response           |
| `401 Unauthorized`          | Invalid or missing auth token | Prompt user for credentials    |
| `404 Not Found`             | File/resource doesn't exist   | Show "file not found" message  |
| `500 Internal Server Error` | Server error                  | Show error, allow manual retry |

---

## Option 2: New Provider Integration

If you need to integrate a completely new provider type (e.g., GitLab, Bitbucket, Azure DevOps), follow these steps.

### SourceProvider Interface

All source providers must implement the `SourceProvider` interface:

```typescript
export interface SourceProvider {
  /**
   * Fetches the complete file tree/directory structure from the source
   * @param repositoryUrl - The URL or identifier of the repository/source
   * @param branch - The branch, version, or snapshot identifier
   * @param authToken - Optional authentication token (GitHub PAT, API key, etc.)
   * @returns Promise resolving to an array of TreeNode representing the file structure
   */
  getRepositoryTree(repositoryUrl: string, branch: string, authToken?: string): Promise<TreeNode[]>;

  /**
   * Fetches and processes a single file from the source
   * @param repositoryUrl - The URL or identifier of the repository/source
   * @param branch - The branch, version, or snapshot identifier
   * @param filePath - The relative path to the file within the repository
   * @param authToken - Optional authentication token (GitHub PAT, API key, etc.)
   * @returns Promise resolving to a ProcessedFile containing the file content and metadata
   */
  fetchProcessedFile(
    repositoryUrl: string,
    branch: string,
    filePath: string,
    authToken?: string
  ): Promise<ProcessedFile>;
}
```

### Step 1: Create Your Provider Class

**Location:** `client/src/services/providers/GitlabSourceProvider.ts`

Choose a unique ID for your provider (e.g., `"gitlab"`). This ID will be used throughout the system.

```typescript
import type { ISourceProvider } from "../../types/interfaces/ISourceProvider";
import type { TreeNode } from "../../types/domain/TreeContent";
import type { ProcessedFile } from "../../types/domain/FileContent";

export class GitlabSourceProvider implements ISourceProvider {
  async getRepositoryTree(repositoryUrl: string, branch: string, authToken?: string): Promise<TreeNode[]> {
    // Fetch tree data from GitLab API
    // Transform it to TreeNode[]
    // Return the tree
  }

  async fetchProcessedFile(
    repositoryUrl: string,
    branch: string,
    filePath: string,
    authToken?: string
  ): Promise<ProcessedFile> {
    // Fetch file content from GitLab API
    // Determine the displayType based on file extension
    // Process content appropriately (decode base64, etc.)
    // Return ProcessedFile
  }
}

// Register the provider
import { providerRegistry } from "../provider-registry";
providerRegistry.register({
	metadata: {
		id: "gitlab",
		name: "GitLab",
		requiresAuth: false,
	},
	factory: () => new GitlabSourceProvider(),
});

```

### Step 2: Register the Provider in Factory

**Location:** `client/src/services/source-provider-factory.ts`

Add your provider to the switch statement using the provider ID as a string:

```typescript
import { providerRegistry } from "./provider-registry";

// Import all providers to register them
import "./providers/github-source-provider";
import "./providers/single-file-source-provider";
import "./providers/gitlab-source-provider"; // Import your new provider

export const useSourceProviderFactory = () => {
	return {
		createProvider: (id: string) => providerRegistry.getProvider(id),
		getAvailableProviders: () => providerRegistry.getAllMetadata(),
	};
};

```

### Step 3: Add Manager UI Support

For the provider to appear as an option in the Manager application, you need to update two files:

#### A. Add to RepositoryType Enum

**Location:** `manager/shared/types/RepositoryType.ts`

```typescript
export enum RepositoryType {
  github = "github",
  singleFile = "singleFile",
  gitlab = "gitlab",  // Add your provider ID here
}
```

#### B. Add to Repository Type Options

**Location:** `manager/shared/types/repository-type-options.ts`

**Important:** The enum in the manager is only used for the UI dropdown selection. The client application uses plain strings for `repositoryType`, so the enum values must match your provider ID strings.

```typescript
import { RepositoryType } from "./RepositoryType";

const repositoryTypeOptions = [
  { value: RepositoryType.github, label: "GitHub", icon: "mdi:github" },
  { value: RepositoryType.singleFile, label: "Static File", icon: "mdi:file-code" },
  { value: RepositoryType.gitlab, label: "GitLab", icon: "mdi:gitlab" },  // Add this
];

export default repositoryTypeOptions;
```

### Step 4: Add Translations (Optional)

If you need custom placeholder text or labels, update the translation files:

**Location:** `manager/i18n/locales/en.json`

```json
{
  "projectForm": {
    "gitlabRepoUrlPlaceholder": "Enter GitLab repository URL"
  }
}
```

Then use it in the form:

```typescript
:placeholder="props.formRepositoryType === 'gitlab' ? t('projectForm.gitlabRepoUrlPlaceholder') : ..."
```
