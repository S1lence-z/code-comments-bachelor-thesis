import { defineStore } from "pinia";
import { fetchProcessedFile } from "../services/githubFileService";
import { FileDisplayType, type ProcessedFile } from "../types/github/githubFile";
import type CommentDto from "../types/dtos/CommentDto";

export const useFileContentStore = defineStore("fileContentStore", {
	state: () => ({
		fileContentCache: new Map<string, ProcessedFile>(),
	}),
	getters: {
		isFileCached: (state) => (filePath: string) => {
			return state.fileContentCache.has(filePath);
		},
	},
	actions: {
		cacheFile(key: string, value: ProcessedFile) {
			this.fileContentCache.set(key, value);
		},
		getFileDownloadUrl(filePath: string) {
			const cachedFile = this.fileContentCache.get(filePath);
			if (cachedFile && cachedFile.downloadUrl) {
				return cachedFile.downloadUrl;
			}
			return "";
		},
		getFileDisplayType(filePath: string): FileDisplayType {
			const cachedFile = this.fileContentCache.get(filePath);
			if (cachedFile) {
				return cachedFile.displayType;
			}
			return FileDisplayType.Binary;
		},
		getFileContent(filePath: string): string {
			const cachedFile = this.fileContentCache.get(filePath);
			if (cachedFile && cachedFile.content) {
				return cachedFile.content;
			}
			return "";
		},
		async cacheFileAsync(filePath: string, repoUrl: string, branch: string, githubPat?: string): Promise<void> {
			if (this.isFileCached(filePath)) {
				return;
			}
			try {
				const processedFile = await fetchProcessedFile(repoUrl, branch, filePath, githubPat);
				this.cacheFile(filePath, processedFile);
			} catch (error) {
				console.error(`Failed to cache file ${filePath}:`, error);
			}
		},
		async getFileContentAsync(
			filePath: string,
			repoUrl: string,
			branch: string,
			githubPat?: string
		): Promise<ProcessedFile> {
			if (this.isFileCached(filePath)) {
				const cached = this.fileContentCache.get(filePath);
				if (cached) return cached;
				else {
					throw new Error(`File content for ${filePath} is not cached.`);
				}
			}

			const processedFile = await fetchProcessedFile(repoUrl, branch, filePath, githubPat);
			this.cacheFile(filePath, processedFile);
			return processedFile;
		},
		async loadCommentedFilesContent(comments: CommentDto[], repoUrl: string, branch: string, githubPat?: string) {
			const filePaths = Array.from(
				new Set(
					comments
						.filter((comment) => comment.location.filePath)
						.map((comment) => comment.location.filePath as string)
				)
			);
			for (const filePath of filePaths) {
				await this.cacheFileAsync(filePath, repoUrl, branch, githubPat);
			}
		},
	},
});
