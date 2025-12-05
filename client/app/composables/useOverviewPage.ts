import { CommentType } from "../../../base/app/types/dtos/comment-type";
import { groupCommentsByFile, sortCommentsByLineNumber } from "../utils/comments";

export function useOverviewPage() {
	// Query params composable
	const { navigateToCodeEditorWithFile } = useQueryParams();

	// Stores
	const projectDataStore = useProjectDataStore();

	// Filtering state
	const selectedCommentTypeFilter = ref<CommentType | null>(null);
	const totalCommentCount = computed(() => projectDataStore.getAllComments.length);
	const isLoadingComments = computed(() => projectDataStore.isLoadingComments);
	const allComments = computed(() => projectDataStore.getAllComments);

	const groupedCommentsByFile = computed(() => {
		// Use utility function to group comments by file
		const grouped = groupCommentsByFile(projectDataStore.getAllComments);

		// Sort comments within each file by line number using utility function
		Object.keys(grouped).forEach((filePath) => {
			grouped[filePath] = sortCommentsByLineNumber(grouped[filePath] ?? []);
		});

		return grouped;
	});

	// Methods
	const setCommentTypeFilter = (commentType: CommentType | null): void => {
		selectedCommentTypeFilter.value = commentType;
	};

	const openFileInEditor = (filePath: string) => {
		navigateToCodeEditorWithFile(filePath);
	};

	return {
		// Local state
		selectedCommentTypeFilter,
		// Computed
		totalCommentCount,
		groupedCommentsByFile,
		allComments,
		isLoadingComments,
		// Methods
		openFileInEditor,
		setCommentTypeFilter,
	};
}
