import type { ProcessedFile, FileDisplayType, GithubFileContentResponse } from "../types/githubFile";

export async function fetchProcessedFile(
	repoUrl: string,
	branch: string,
	path: string,
	GITHUB_PAT?: string
): Promise<ProcessedFile> {
	const url = new URL(repoUrl);
	const [owner, repo] = url.pathname.split("/").filter(Boolean);
	if (!owner || !repo) {
		throw new Error("Invalid repository URL for API construction.");
	}
	const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

	const headers: HeadersInit = {
		Accept: "application/vnd.github+json",
	};
	if (GITHUB_PAT) {
		headers["Authorization"] = `Bearer ${GITHUB_PAT}`;
	}

	const response = await fetch(contentUrl, { headers });
	if (!response.ok) {
		const errorText = await response.json();
		throw new Error(`Status ${response.status}: ${errorText || "Failed to load file content."}`);
	}
	const data: GithubFileContentResponse = await response.json();
	const processedFile = processFileContent(data);
	return processedFile;
}

function processFileContent(file: GithubFileContentResponse): ProcessedFile {
	const { name, content, download_url } = file;
	let displayType: FileDisplayType = "text";
	let contentToDisplay: string | null = null;

	if (name.endsWith(".jpg") || name.endsWith(".png")) {
		displayType = "image";
	} else if (name.endsWith(".pdf")) {
		displayType = "pdf";
	} else if (!content) {
		displayType = "binary";
	} else {
		// Github API returns base64 encoded content for text files
		contentToDisplay = atob(content);
	}

	return {
		displayType,
		content: contentToDisplay,
		downloadUrl: download_url,
		fileName: name,
	};
}
