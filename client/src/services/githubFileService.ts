import type { ProcessedFile, GithubFileContentResponse } from "../types/github/githubFile";
import { FileDisplayType } from "../types/github/githubFile";

const useGithubFileService = () => {
	const base64ToBlobUrl = (base64Data: string, mimeType: string): string | null => {
		if (!base64Data) return null;
		try {
			const sanitized = base64Data.replace(/\s/g, "");
			const byteCharacters = atob(sanitized);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], { type: mimeType });
			return URL.createObjectURL(blob);
		} catch (error) {
			console.error("Failed to create blob URL from base64 data", error);
			return null;
		}
	};

	const processFileContent = (file: GithubFileContentResponse): ProcessedFile => {
		const { name, content, download_url: downloadUrl } = file;
		let displayType: FileDisplayType = FileDisplayType.Text;
		let fileContent: string | null = null;
		let previewUrl: string | null = downloadUrl;

		if (name.endsWith(".jpg") || name.endsWith(".png")) {
			displayType = FileDisplayType.Image;
			previewUrl = downloadUrl;
		} else if (name.endsWith(".pdf")) {
			displayType = FileDisplayType.PDF;
			previewUrl = content ? base64ToBlobUrl(content, "application/pdf") : downloadUrl;
		} else if (!content) {
			displayType = FileDisplayType.Binary;
			previewUrl = null;
		} else {
			// Github API returns base64 encoded content for text files
			const decoded = atob(content.replace(/\s/g, ""));
			const bytes = new Uint8Array(decoded.length);
			for (let i = 0; i < decoded.length; i++) {
				bytes[i] = decoded.charCodeAt(i);
			}
			fileContent = new TextDecoder("utf-8").decode(bytes);
			previewUrl = null;
		}

		return {
			displayType,
			content: fileContent,
			downloadUrl: downloadUrl,
			previewUrl,
			fileName: name,
		};
	};

	const fetchProcessedFile = async (
		repositoryUrl: string,
		branch: string,
		path: string,
		githubPat?: string
	): Promise<ProcessedFile> => {
		// Validate and parse the repository URL
		const url = new URL(repositoryUrl);
		const [owner, repo] = url.pathname.split("/").filter(Boolean);
		if (!owner || !repo) {
			throw new Error("Invalid github repository URL for API construction.");
		}

		// Construct the API call
		const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
		const headers: HeadersInit = {
			Accept: "application/vnd.github+json",
		};
		if (githubPat) {
			headers["Authorization"] = `Bearer ${githubPat}`;
		}

		// Fetch the file content
		const response = await fetch(contentUrl, { headers });
		if (!response.ok) {
			const errorText = await response.json();
			throw new Error(`Failed to load file content for ${path}. Error ${response.status}: ${errorText || ""}`);
		}
		const responseData: GithubFileContentResponse = await response.json();
		const processedFile = processFileContent(responseData);
		return processedFile;
	};
	return { fetchProcessedFile };
};

export default useGithubFileService;
