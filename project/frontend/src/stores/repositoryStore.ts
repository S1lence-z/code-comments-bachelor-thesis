import { defineStore } from "pinia";
import { useRoute } from "vue-router";
import type { TreeNode } from "../types/githubTree";
import type ICommentDto from "../../../shared/dtos/ICommentDto";
import type ICategoryDto from "../../../shared/dtos/ICategoryDto";
import { extractBaseUrl } from "../utils/urlUtils";
import { fetchRepoTreeAPI } from "../services/githubTreeService";
import { fetchComments, getAllCategories } from "../services/commentsService";

export const useRepositoryStore = defineStore("repositoryStore", {
	state: () => ({
		repositoryUrl: "",
		writeApiUrl: "",
		initialBranch: "main",
		githubPat: import.meta.env.VITE_GITHUB_PAT || "",
		fileTreeData: [] as TreeNode[],
		comments: [] as ICommentDto[],
		categories: [] as ICategoryDto[],
		// Loading states
		isLoadingRepo: false,
		isLoadingComments: false,
		isLoadingCategories: false,
		// Error states
		errorMessage: "",
	}),
	getters: {
		repoUrl: (state) => state.repositoryUrl,
		commentsApiUrl: (state) => state.writeApiUrl,
		branch: (state) => state.initialBranch,
		githubPersonalAccessToken: (state) => state.githubPat,
		fileTree: (state) => state.fileTreeData,
		allComments: (state) => state.comments,
		allCategories: (state) => state.categories,
		// Get comments for a specific file
		getCommentsForFile: (state) => (filePath: string) => {
			return state.comments.filter((comment: ICommentDto) => comment.filePath === filePath);
		},
		isTreeFetched: (state) => state.fileTreeData.length > 0,
		isCommentsFetched: (state) => state.comments.length > 0,
		isCategoriesFetched: (state) => state.categories.length > 0,
	},
	actions: {
		syncStateWithRoute() {
			const route = useRoute();
			const query = route.query;

			this.repositoryUrl = decodeURIComponent(query.repoUrl as string) || "";
			this.writeApiUrl = decodeURIComponent(query.commentsApiUrl as string) || "";
			this.initialBranch = decodeURIComponent(query.branch as string) || "main";
			this.githubPat = import.meta.env.VITE_GITHUB_PAT || "";
		},

		async initializeData() {
			this.syncStateWithRoute();
			if (!this.repositoryUrl || !this.writeApiUrl) {
				this.errorMessage = "Repository URL and Comments API URL must be set.";
				return;
			}
			await Promise.all([this.fetchRepositoryTree(), this.fetchAllComments(), this.fetchAllCategories()]);
		},

		async fetchRepositoryTree() {
			if (!this.repositoryUrl) return;

			this.isLoadingRepo = true;
			try {
				if (this.isTreeFetched) {
					console.log("File tree already fetched, skipping API call.");
					return;
				}
				this.fileTreeData = await fetchRepoTreeAPI(this.repositoryUrl, this.initialBranch, this.githubPat);
			} catch (error: any) {
				this.errorMessage = error.message;
				console.error("Error fetching repo tree:", error);
				this.fileTreeData = [];
			} finally {
				this.isLoadingRepo = false;
			}
		},

		async fetchAllComments() {
			if (!this.writeApiUrl) return;

			this.isLoadingComments = true;
			try {
				if (this.isCommentsFetched) {
					console.log("Comments already fetched, skipping API call.");
					return;
				}
				const response = await fetchComments(this.writeApiUrl);
				this.comments = response.comments || [];
			} catch (error: any) {
				this.errorMessage = `Failed to load comments: ${error.message}`;
				console.error("Error fetching comments:", error);
				this.comments = [];
			} finally {
				this.isLoadingComments = false;
			}
		},

		async fetchAllCategories() {
			if (!this.writeApiUrl) return;

			this.isLoadingCategories = true;
			try {
				if (this.isCategoriesFetched) {
					console.log("Categories already fetched, skipping API call.");
					return;
				}
				const response = await getAllCategories(extractBaseUrl(this.writeApiUrl));
				this.categories = response;
			} catch (error: any) {
				this.errorMessage = `Failed to load categories: ${error.message}`;
				console.error("Error fetching categories:", error);
				this.categories = [];
			} finally {
				this.isLoadingCategories = false;
			}
		},

		addComment(comment: ICommentDto) {
			this.comments.push(comment);
		},

		updateComment(updatedComment: ICommentDto) {
			const index = this.comments.findIndex((c: ICommentDto) => c.id === updatedComment.id);
			if (index !== -1) {
				this.comments[index] = updatedComment;
			}
		},

		removeComment(commentId: number) {
			const index = this.comments.findIndex((c: ICommentDto) => c.id === commentId);
			if (index !== -1) {
				this.comments.splice(index, 1);
			}
		},
	},
});
