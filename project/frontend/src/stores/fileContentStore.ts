import { defineStore } from "pinia";
import { fetchProcessedFile } from "../services/githubFileService";
import type { ProcessedFile } from "../types/githubFile";

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

		async getFileContent(
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
	},
});
