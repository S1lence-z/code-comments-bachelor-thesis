import { defineStore } from "pinia";
import { useRepositoryProviderFactory } from "../services/repository-provider-factory";
import { FileDisplayType, type ProcessedFile } from "../types/domain/file-content";
import type CommentDto from "../types/dtos/comment-dto";
import { CommentType } from "../types/dtos/comment-type";
import { useProjectStore } from "./projectStore";
import { useErrorHandler } from "../composables/useErrorHandler";

export const useFileContentStore = defineStore("fileContentStore", {
	state: () => ({
		fileContentCache: new Map<string, ProcessedFile>(),
		isBeingCached: new Set<string>(),
	}),
	getters: {
		isFileCached: (state) => (filePath: string) => {
			return state.fileContentCache.has(filePath);
		},
		getFileDisplayType:
			(state) =>
			(filePath: string): FileDisplayType => {
				const cachedFile = state.fileContentCache.get(filePath);
				if (cachedFile) {
					return cachedFile.displayType;
				}
				return FileDisplayType.Binary;
			},
		getFileContent:
			(state) =>
			(filePath: string): string => {
				const cachedFile = state.fileContentCache.get(filePath);
				if (cachedFile && cachedFile.content) {
					return cachedFile.content;
				}
				return "";
			},
		getFileDownloadUrl: (state) => (filePath: string) => {
			const cachedFile = state.fileContentCache.get(filePath);
			if (cachedFile && cachedFile.downloadUrl) {
				return cachedFile.downloadUrl;
			}
			return "";
		},
		getFilePreviewUrl: (state) => (filePath: string) => {
			const cachedFile = state.fileContentCache.get(filePath);
			if (cachedFile && cachedFile.previewUrl) {
				return cachedFile.previewUrl;
			}
			return "";
		},
	},
	actions: {
		cacheFile(key: string, value: ProcessedFile) {
			this.fileContentCache.set(key, value);
		},
		async cacheFileAsync(
			filePath: string,
			repositoryUrl: string,
			branch: string,
			authToken?: string
		): Promise<void> {
			const projectStore = useProjectStore();
			const { createProvider } = useRepositoryProviderFactory();
			const { handleError } = useErrorHandler();

			if (this.isFileCached(filePath) || this.isBeingCached.has(filePath)) {
				return;
			}

			this.isBeingCached.add(filePath);

			try {
				const provider = createProvider(projectStore.getRepositoryType);
				const processedFile = await provider.fetchProcessedFile(repositoryUrl, branch, filePath, authToken);
				this.cacheFile(filePath, processedFile);
			} catch (error) {
				handleError(error);
			} finally {
				this.isBeingCached.delete(filePath);
			}
		},
		async getFileContentAsync(
			filePath: string,
			repositoryUrl: string,
			branch: string,
			authToken?: string
		): Promise<ProcessedFile> {
			const projectStore = useProjectStore();
			const { createProvider } = useRepositoryProviderFactory();
			const { handleError } = useErrorHandler();

			if (this.isFileCached(filePath)) {
				const cached = this.fileContentCache.get(filePath);
				if (cached) return cached;
				else throw new Error("File is marked as cached but not found in cache.");
			}

			try {
				const provider = createProvider(projectStore.getRepositoryType);
				const processedFile = await provider.fetchProcessedFile(repositoryUrl, branch, filePath, authToken);
				this.cacheFile(filePath, processedFile);
				return processedFile;
			} catch (error) {
				handleError(error, {
					customMessage: `Failed to load file: ${filePath}`,
				});
				throw error;
			}
		},
		async loadCommentedFilesContent(
			comments: CommentDto[],
			repositoryUrl: string,
			branch: string,
			authToken?: string
		) {
			const filePaths = Array.from(
				new Set(
					comments
						.filter(
							(comment) =>
								comment.location.filePath &&
								(comment.type == CommentType.Singleline || comment.type == CommentType.Multiline)
						)
						.map((comment) => comment.location.filePath as string)
				)
			);
			for (const filePath of filePaths) {
				await this.cacheFileAsync(filePath, repositoryUrl, branch, authToken);
			}
		},
	},
});
