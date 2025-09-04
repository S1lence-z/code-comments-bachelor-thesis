import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useRepositoryStore } from "../../stores/repositoryStore";
import { useProjectStore } from "../../stores/projectStore";
import { useFileContentStore } from "../../stores/fileContentStore";
import { CommentType } from "../../types/enums/CommentType";
import { groupCommentsByFile, sortCommentsByLineNumber } from "../../utils/commentUtils";

export function useOverviewPage() {
	// Router
	const router = useRouter();

	// Stores
	const projectStore = useProjectStore();
	const repositoryStore = useRepositoryStore();
	const fileContentStore = useFileContentStore();

	// Store refs
	const { repositoryUrl, writeApiUrl, repositoryBranch, githubPat } = storeToRefs(projectStore);
	const { allComments, isLoadingComments } = storeToRefs(repositoryStore);

	// Filtering state
	const selectedCommentTypeFilter = ref<CommentType | null>(null);

	const totalCommentCount = computed(() => allComments.value.length);

	const groupedCommentsByFile = computed(() => {
		// Use utility function to group comments by file
		const grouped = groupCommentsByFile(allComments.value);

		// Sort comments within each file by line number using utility function
		Object.keys(grouped).forEach((filePath) => {
			grouped[filePath] = sortCommentsByLineNumber(grouped[filePath]);
		});

		return grouped;
	});

	// Methods
	const navigateToCodeReview = (): void => {
		router.push({
			path: "/review/code",
			query: router.currentRoute.value.query,
		});
	};

	const setCommentTypeFilter = (commentType: CommentType | null): void => {
		selectedCommentTypeFilter.value = commentType;
	};

	const initializeRepositoryData = async (): Promise<void> => {
		try {
			await repositoryStore.initializeStoreAsync(
				repositoryUrl.value,
				writeApiUrl.value,
				repositoryBranch.value,
				githubPat.value
			);
		} catch (error) {
			console.error("Failed to initialize repository data:", error);
		}
	};

	const loadCommentedFilesContent = async (): Promise<void> => {
		const filePaths = Object.keys(groupCommentsByFile(allComments.value));
		// Load content for all commented files
		for (const filePath of filePaths) {
			if (!fileContentStore.isFileCached(filePath)) {
				try {
					await fileContentStore.getFileContentAsync(
						filePath,
						repositoryUrl.value,
						repositoryBranch.value,
						githubPat.value
					);
				} catch (error) {
					console.error(`Failed to load content for ${filePath}:`, error);
				}
			}
		}
	};

	const openFileInEditor = (filePath: string) => {
		const params = {
			repoUrl: repositoryUrl.value,
			commentsApiUrl: writeApiUrl.value,
			branch: repositoryBranch.value,
			file: filePath,
		};
		router.push({ path: "/review/code", query: params });
	};

	return {
		// Store refs
		allComments,
		isLoadingComments,

		// Stores (for direct access if needed)
		projectStore,
		repositoryStore,

		// Router
		router,

		// Local state
		selectedCommentTypeFilter,

		// Computed
		totalCommentCount,
		groupedCommentsByFile,

		// Methods
		navigateToCodeReview,
		openFileInEditor,
		setCommentTypeFilter,
		initializeRepositoryData,
		loadCommentedFilesContent,
	};
}
