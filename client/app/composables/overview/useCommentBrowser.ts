import type CommentDto from "../../../../base/app/types/dtos/comment-dto";
import { CommentType } from "../../../../base/app/types/dtos/comment-type";
import { useFileContentStore } from "../../stores/fileContentStore";

export interface CommentBrowserProps {
	allCommentsByFile: Record<string, CommentDto[]>;
	commentTypeFilter: CommentType | null;
}

export interface CommentBrowserEmits {
	(event: "openFileInEditor", filePath: string): void;
}

export function useCommentBrowser(props: CommentBrowserProps, emit: CommentBrowserEmits) {
	// Store
	const fileContentStore = useFileContentStore();
	const commentBrowserStore = useCommentBrowserStore();
	commentBrowserStore.loadState();

	// Local state
	const expandedFiles = ref<Set<string>>(new Set(commentBrowserStore.openedFiles));
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
		return Object.fromEntries(
			Object.entries(tempFilteredComments).filter(([, comments]) => comments.length > 0)
		);
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
				.filter(([, comments]) => (comments?.length ?? 0) > 0)
		);
	});

	// Methods
	const toggleFileExpanded = (filePath: string): void => {
		if (expandedFiles.value.has(filePath)) {
			expandedFiles.value.delete(filePath);
		} else {
			expandedFiles.value.add(filePath);
		}
		commentBrowserStore.toggleFile(filePath);
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

		const formatWithLineNumbers = (slicedLines: string[], startLine: number): string => {
			return slicedLines
				.map((line, index) => {
					const lineNum = startLine + index + 1;
					return `${String(lineNum).padStart(4)} | ${line}`;
				})
				.join("\n");
		};

		if (comment.type === CommentType.Singleline && comment.location.lineNumber) {
			const startLine = Math.max(0, comment.location.lineNumber - showedLineOffset.value);
			const endLine = Math.min(
				lines.length,
				comment.location.lineNumber + showedLineOffset.value
			);
			return formatWithLineNumbers(lines.slice(startLine, endLine), startLine);
		}

		if (
			comment.type === CommentType.Multiline &&
			comment.location.startLineNumber &&
			comment.location.endLineNumber
		) {
			const startLine = Math.max(
				0,
				comment.location.startLineNumber - showedLineOffset.value
			);
			const endLine = Math.min(
				lines.length,
				comment.location.endLineNumber + showedLineOffset.value
			);
			return formatWithLineNumbers(lines.slice(startLine, endLine), startLine);
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

	// Load the comment browser state from sessionStorage
	const loadOpenCardsState = () => {
		commentBrowserStore.loadState();
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
		loadOpenCardsState,
	};
}
