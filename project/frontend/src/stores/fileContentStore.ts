import { defineStore } from "pinia";
import { fetchFileContentAPI } from "../services/githubService";

export const useFileContentStore = defineStore("fileContentStore", {
	state: () => ({
		fileContentCache: new Map<string, string>(),
	}),
	getters: {
		isFileCached: (state) => (filePath: string) => {
			return state.fileContentCache.has(filePath);
		},
	},
	actions: {
		cacheFile(key: string, value: string) {
			this.fileContentCache.set(key, value);
		},

		async getFileContent(filePath: string, repoUrl: string, branch: string, githubPat?: string): Promise<string> {
			if (this.isFileCached(filePath)) {
				const cached = this.fileContentCache.get(filePath);
				if (cached) return cached;
				else {
					throw new Error(`File content for ${filePath} is not cached.`);
				}
			}

			const content = await fetchFileContentAPI(repoUrl, branch, filePath, githubPat);
			this.cacheFile(filePath, content);
			return content;
		},
	},
});
