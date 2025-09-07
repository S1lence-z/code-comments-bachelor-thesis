import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useProjectDataStore } from "../../stores/projectDataStore";
import { useProjectStore } from "../../stores/projectStore";
import { CommentType } from "../../types/enums/CommentType";
import { groupCommentsByFile, sortCommentsByLineNumber } from "../../utils/commentUtils";

export function useOverviewPage() {
	// Router
	const router = useRouter();

	// Stores
	const projectStore = useProjectStore();
	const projectDataStore = useProjectDataStore();

	// Store refs
	const { allComments, isLoadingComments } = storeToRefs(projectDataStore);

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
	const setCommentTypeFilter = (commentType: CommentType | null): void => {
		selectedCommentTypeFilter.value = commentType;
	};

	const openFileInEditor = (filePath: string) => {
		const updatedParams = {
			...router.currentRoute.value.query,
			file: filePath,
		};
		router.push({ name: "Code Review", query: updatedParams });
	};

	return {
		// Store refs
		allComments,
		isLoadingComments,

		// Stores (for direct access if needed)
		projectStore,
		projectDataStore,

		// Router
		router,

		// Local state
		selectedCommentTypeFilter,

		// Computed
		totalCommentCount,
		groupedCommentsByFile,

		// Methods
		openFileInEditor,
		setCommentTypeFilter,
	};
}
