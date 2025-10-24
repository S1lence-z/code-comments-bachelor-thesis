import { ref, computed, watch, shallowRef } from "vue";
import { EditorView } from "@codemirror/view";
import { createEditorExtensions } from "../../codeMirror/configs/editorConfig";
import { useSettingsStore } from "../../stores/settingsStore";
import { useKeyboardShortcutsStore } from "../../stores/keyboardShortcutsStore";
import { useProjectDataStore } from "../../stores/projectDataStore";
import type CommentDto from "../../types/dtos/CommentDto";
import { CommentType } from "../../types/dtos/CommentType";
import { showCommentFormEffect, hideCommentFormEffect } from "../../codeMirror/commentFormExtension";
import type RawCommentData from "../../types/domain/RawCommentData";

export interface CodeEditorProps {
	filePath: string | null;
	fileContent: string | null | undefined;
	commentInFile: CommentDto[];
}

export interface CodeEditorEmits {
	(event: "inline-form-submit", payload: RawCommentData): void;
	(event: "inline-form-delete", commentId: string): void;
}

export function useCodeEditor(props: CodeEditorProps, emit: CodeEditorEmits) {
	// Store access
	const settingsStore = useSettingsStore();
	const keyboardShortcutsStore = useKeyboardShortcutsStore();
	const projectDataStore = useProjectDataStore();

	// Local state
	const currentContent = ref<string>("");
	const editorView = shallowRef<EditorView>();
	const lastSelectionTimeout = ref<number | null>(null);

	// Inline form state
	const activeFormState = ref<{
		lineNumber: number;
		commentId: string | null;
		commentType: CommentType;
		filePath: string;
		startLineNumber: number | null;
		endLineNumber: number | null;
	} | null>(null);

	// Computed properties
	const editorPlaceholder = computed(() => {
		return props.filePath ? `Content of ${props.filePath}` : "Code will appear here...";
	});

	const isKeyboardMode = computed(() => settingsStore.isKeyboardMode);

	const getDefaultCategoryLabel = (): string => {
		const categories = projectDataStore.allCategories;
		return categories.length > 0 ? categories[0].label : "";
	};

	const handleCommentDeletion = (commentId: string): void => {
		if (!commentId) return;
		emit("inline-form-delete", commentId);
		hideForm();
	};

	const handleEditCommentInline = (commentId: string): void => {
		const comment = props.commentInFile.find((c) => c.id === commentId);
		if (!comment || !props.filePath) return;

		if (comment.type === CommentType.Singleline) {
			showForm(
				comment.location.lineNumber!,
				CommentType.Singleline,
				props.filePath,
				comment.location.lineNumber,
				null,
				commentId
			);
		} else if (comment.type === CommentType.Multiline) {
			showForm(
				comment.location.startLineNumber!,
				CommentType.Multiline,
				props.filePath,
				comment.location.startLineNumber,
				comment.location.endLineNumber,
				commentId
			);
		}
	};

	const handleCommentUpsert = async (
		content: string,
		categoryLabel: string,
		commentId: string | null
	): Promise<void> => {
		if (!activeFormState.value) return;

		// TODO: instead of the label we should pass the category ID or the value, which will be resolved to ID in parent component
		const commentData: RawCommentData = {
			id: commentId,
			commentType: activeFormState.value.commentType,
			categoryLabel: categoryLabel,
			filePath: activeFormState.value.filePath,
			content: content,
			startLineNumber: activeFormState.value.startLineNumber || activeFormState.value.lineNumber,
			endLineNumber: activeFormState.value.endLineNumber || activeFormState.value.lineNumber,
		};

		// Emit to parent (CodeReviewPage) to handle the actual submission
		emit("inline-form-submit", commentData);

		// Hide the form after submission
		hideForm();
	};

	const showForm = (
		lineNumber: number,
		commentType: CommentType,
		filePath: string,
		startLine: number | null = null,
		endLine: number | null = null,
		commentId: string | null = null
	): void => {
		if (!editorView.value) return;

		// Find existing comment if editing
		const existingComment = commentId ? props.commentInFile.find((c) => c.id === commentId) : null;

		activeFormState.value = {
			lineNumber,
			commentId,
			commentType,
			filePath,
			startLineNumber: startLine,
			endLineNumber: endLine,
		};

		// Dispatch the show form effect to CodeMirror
		editorView.value.dispatch({
			effects: showCommentFormEffect.of({
				lineNumber,
				commentId,
				commentType,
				initialContent: existingComment?.content || "",
				initialCategoryLabel: existingComment?.category?.label || getDefaultCategoryLabel(),
				filePath,
				startLineNumber: startLine,
				endLineNumber: endLine,
			}),
		});
	};

	const hideForm = (): void => {
		if (!editorView.value) return;

		activeFormState.value = null;

		// Dispatch the hide form effect to CodeMirror
		editorView.value.dispatch({
			effects: hideCommentFormEffect.of(),
		});
	};

	const handleReplyCommentInline = (commentId: string): void => {
		const comment = props.commentInFile.find((c) => c.id === commentId);
		if (!comment || !props.filePath) return;
		if (comment.type === CommentType.Singleline) {
			showForm(
				comment.location.lineNumber!,
				CommentType.Singleline,
				props.filePath,
				comment.location.lineNumber,
				null,
				null
			);
		} else if (comment.type === CommentType.Multiline) {
			showForm(
				comment.location.startLineNumber!,
				CommentType.Multiline,
				props.filePath,
				comment.location.startLineNumber,
				comment.location.endLineNumber,
				null
			);
		}
	};

	const extensions = computed(() => {
		const currentFileComments = props.commentInFile;
		return createEditorExtensions(
			props.filePath,
			currentFileComments,
			settingsStore.isKeyboardMode,
			settingsStore.isCompactCommentWidget,
			keyboardShortcutsStore.getShortcuts,
			projectDataStore.allCategories,
			// Actions
			handleCommentDeletion,
			handleEditCommentInline,
			handleReplyCommentInline,
			hideForm,
			handleCommentUpsert,
			handleAddNewSingleLineComment
		);
	});

	const handleAddNewSingleLineComment = (lineNumber: number, filePath: string): void => {
		// Check if there's an existing comment at this line
		const existingComment = props.commentInFile.find(
			(c) => c.type === CommentType.Singleline && c.location.lineNumber === lineNumber
		);

		// Show inline form instead of emitting event
		showForm(lineNumber, CommentType.Singleline, filePath, lineNumber, null, existingComment?.id || null);
	};

	const handleEditorDoubleClick = (event: MouseEvent): void => {
		if (!editorView.value) return;

		const pos = editorView.value.posAtCoords({ x: event.clientX, y: event.clientY });
		if (pos !== null && pos !== undefined) {
			const lineNumber = editorView.value.state.doc.lineAt(pos).number;
			if (props.filePath) {
				handleAddNewSingleLineComment(lineNumber, props.filePath);
			}
		}
	};

	const handleCodemirrorReady = (payload: any): void => {
		editorView.value = payload.view;

		// Add event listeners for selection change
		if (editorView.value) {
			editorView.value.dom.addEventListener("mouseup", handleSelectionChange);
			editorView.value.dom.addEventListener("keyup", handleSelectionChange);
		}
	};

	const handleSelectionChange = (): void => {
		if (!editorView.value) return;

		// Don't trigger if there's already an active form
		if (activeFormState.value) return;

		if (lastSelectionTimeout.value) {
			clearTimeout(lastSelectionTimeout.value);
		}

		// Debounce the selection change to avoid too many events
		lastSelectionTimeout.value = window.setTimeout(() => {
			if (!editorView.value || !props.filePath) return;

			const selection = editorView.value.state.selection.main;
			if (selection.empty) return;

			const startLineNumber = editorView.value.state.doc.lineAt(selection.from).number;
			const endLineNumber = editorView.value.state.doc.lineAt(selection.to).number;

			if (startLineNumber !== endLineNumber) {
				// Check if there's an existing multiline comment
				const existingComment = props.commentInFile.find(
					(c) =>
						c.type === CommentType.Multiline &&
						c.location.startLineNumber === startLineNumber &&
						c.location.endLineNumber === endLineNumber
				);

				// Show inline form for multiline comment
				showForm(
					startLineNumber,
					CommentType.Multiline,
					props.filePath!,
					startLineNumber,
					endLineNumber,
					existingComment?.id || null
				);
			}
		}, 300);
	};

	// Watch for file content changes
	watch(
		() => props.fileContent,
		(newVal: string | null | undefined) => {
			currentContent.value = newVal ?? "";
		},
		{ immediate: true }
	);

	return {
		// State
		currentContent,

		// Computed
		editorPlaceholder,
		extensions,
		isKeyboardMode,

		// Methods
		handleCodemirrorReady,
		handleEditorDoubleClick,
	};
}
