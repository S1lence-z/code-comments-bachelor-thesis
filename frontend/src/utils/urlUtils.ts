export interface RepoUrlInfo {
	repoUrl: string;
	branch: string;
	owner: string;
	repoName: string;
}

export function parseGitHubRepoUrl(url: string, defaultBranch: string = "main"): RepoUrlInfo | null {
	if (!url || !url.startsWith("https://github.com/")) {
		return null;
	}
	try {
		const tempUrl = new URL(url);
		const pathParts = tempUrl.pathname.split("/").filter(Boolean);
		if (pathParts.length < 2) {
			return null;
		}
		const owner = pathParts[0];
		const repoName = pathParts[1];
		// Basic parsing, branch might be part of URL or a separate param, this assumes simple repo URL
		return {
			repoUrl: `https://github.com/${owner}/${repoName}`,
			branch: defaultBranch, // Placeholder, actual branch might be determined differently
			owner,
			repoName,
		};
	} catch (e) {
		console.error("Error parsing GitHub URL:", e);
		return null;
	}
}

export function parseRepoAndBranchFromLocation(): { repoUrl: string; branch: string } | { error: string } {
	try {
		const params = new URLSearchParams(globalThis.location.search);
		const urlParam = params.get("repo_url");
		if (!urlParam) {
			return { error: "repo_url parameter is missing." };
		}
		if (!urlParam.startsWith("https://github.com/")) {
			return { error: "repo_url must be a valid GitHub repository URL." };
		}

		const tempUrl = new URL(urlParam);
		const pathParts = tempUrl.pathname.split("/").filter(Boolean);
		if (pathParts.length < 2) {
			return { error: "Invalid GitHub repository URL format." };
		}

		return {
			repoUrl: urlParam,
			branch: params.get("branch") || "main",
		};
	} catch (_e) {
		return { error: "Invalid repo_url parameter." };
	}
}

export function extractBaseUrl(url: string): string {
	try {
		const parsedUrl = new URL(url);
		return `${parsedUrl.protocol}//${parsedUrl.host}`;
	} catch (e) {
		console.error("Error extracting base URL:", e);
		return "";
	}
}
