import { computed, ref } from "vue";
import type CommentDto from "../../types/dtos/CommentDto";
import { CommentType } from "../../types/enums/CommentType";
import { useFileContentStore } from "../../stores/fileContentStore";

export interface CommentBrowserProps {
	allCommentsByFile: Record<string, CommentDto[]>;
	commentTypeFilter: CommentType | null;
}

export interface CommentBrowserEmits {
	(event: "openFileInEditor", filePath: string): void;
}

export function useCommentBrowser(props: CommentBrowserProps, emit: CommentBrowserEmits) {
	// Store access
	const fileContentStore = useFileContentStore();

	// Local state
	const expandedFiles = ref<Set<string>>(new Set());
	const showedLineOffset = ref(3);

	// Computed properties
	const filteredComments = computed(() => {
		if (!props.commentTypeFilter) {
			return props.allCommentsByFile;
		}
		// Filter comments by the selected comment type
		const tempFilteredComments = Object.fromEntries(
			Object.entries(props.allCommentsByFile).map(([filePath, comments]) => [
				filePath,
				comments.filter((comment) => comment.type === props.commentTypeFilter),
			])
		);
		// Remove files with no comments after filtering
		return Object.fromEntries(Object.entries(tempFilteredComments).filter(([, comments]) => comments.length > 0));
	});

	// Project comment
	const projectComments = computed((): CommentDto[] => {
		const projectCommentsList: CommentDto[] = [];

		Object.entries(filteredComments.value).forEach(([, comments]) => {
			comments.forEach((comment) => {
				if (comment.type === CommentType.Project) {
					projectCommentsList.push(comment);
				}
			});
		});

		return projectCommentsList;
	});

	// Filtered file-based comments excluding the project comment
	const fileBasedComments = computed((): Record<string, CommentDto[]> => {
		return Object.fromEntries(
			Object.entries(filteredComments.value)
				.map(([filePath, comments]) => [
					filePath,
					comments.filter((comment) => comment.type !== CommentType.Project),
				])
				.filter(([, comments]) => comments.length > 0)
		);
	});

	// Methods
	const toggleFileExpanded = (filePath: string): void => {
		if (expandedFiles.value.has(filePath)) {
			expandedFiles.value.delete(filePath);
		} else {
			expandedFiles.value.add(filePath);
		}
	};

	const getCodePreview = (filePath: string, comment: CommentDto): string => {
		if (!fileContentStore.isFileCached(filePath)) {
			return "Loading...";
		}

		const cachedFile = fileContentStore.fileContentCache.get(filePath);
		if (!cachedFile || !cachedFile.content) {
			return "Content not available";
		}

		const lines = cachedFile.content.split("\n");

		if (comment.type === CommentType.Singleline && comment.location.lineNumber) {
			const startLine = Math.max(0, comment.location.lineNumber - showedLineOffset.value);
			const endLine = Math.min(lines.length, comment.location.lineNumber + showedLineOffset.value);
			return lines.slice(startLine, endLine).join("\n");
		}

		if (
			comment.type === CommentType.Multiline &&
			comment.location.startLineNumber &&
			comment.location.endLineNumber
		) {
			const startLine = Math.max(0, comment.location.startLineNumber - showedLineOffset.value);
			const endLine = Math.min(lines.length, comment.location.endLineNumber + showedLineOffset.value);
			return lines.slice(startLine, endLine).join("\n");
		}

		return "No preview available";
	};

	const hasCodePreview = (comment: CommentDto): boolean => {
		switch (comment.type) {
			case CommentType.Singleline:
			case CommentType.Multiline:
				return true;
			case CommentType.File:
			case CommentType.Project:
			default:
				return false;
		}
	};

	const handleOpenFileInEditor = (filePath: string): void => {
		emit("openFileInEditor", filePath);
	};

	return {
		// State
		expandedFiles,
		showedLineOffset,

		// Computed
		filteredComments,
		projectComments,
		fileBasedComments,

		// Methods
		toggleFileExpanded,
		getCodePreview,
		hasCodePreview,
		handleOpenFileInEditor,
	};
}
