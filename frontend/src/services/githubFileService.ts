import type { ProcessedFile, GithubFileContentResponse } from "../types/github/githubFile";
import { FileDisplayType } from "../types/github/githubFile";

const useGithubFileService = () => {
	const processFileContent = (file: GithubFileContentResponse): ProcessedFile => {
		const { name, content, download_url } = file;
		let displayType: FileDisplayType = FileDisplayType.Text;
		let fileContent: string | null = null;

		if (name.endsWith(".jpg") || name.endsWith(".png")) {
			displayType = FileDisplayType.Image;
		} else if (name.endsWith(".pdf")) {
			displayType = FileDisplayType.PDF;
		} else if (!content) {
			displayType = FileDisplayType.Binary;
		} else {
			// Github API returns base64 encoded content for text files
			fileContent = atob(content);
			const bytes = new Uint8Array(fileContent.length);
			for (let i = 0; i < fileContent.length; i++) {
				bytes[i] = fileContent.charCodeAt(i);
			}
			fileContent = new TextDecoder("utf-8").decode(bytes);
		}

		return {
			displayType,
			content: fileContent,
			downloadUrl: download_url,
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
