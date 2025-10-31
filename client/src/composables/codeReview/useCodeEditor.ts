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
	(event: "inline-form-reply", parentCommentId: string, reply: RawCommentData): void;
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
		parentCommentId: string | null;
	} | null>(null);

	// Computed properties
	const editorPlaceholder = computed(() => {
		return props.filePath ? `Content of ${props.filePath}` : "Code will appear here...";
	});

	const isKeyboardMode = computed(() => settingsStore.isKeyboardMode);

	const handleCommentDeletion = (commentId: string): void => {
		if (!commentId) return;
		emit("inline-form-delete", commentId);
		hideForm();
	};

	const handleEditCommentInline = (commentId: string): void => {
		const comment = props.commentInFile.find((c) => c.id === commentId);
		if (!comment || !props.filePath) return;

		const lineNumber =
			comment.type === CommentType.Singleline ? comment.location.lineNumber! : comment.location.startLineNumber!;

		const endLineNumber = comment.type === CommentType.Multiline ? comment.location.endLineNumber : null;

		showForm(
			comment.type,
			props.filePath,
			comment.content,
			comment.category?.id || projectDataStore.getDefaultCategory.id,
			lineNumber,
			endLineNumber,
			commentId,
			null
		);
	};

	const handleCommentUpsert = async (
		content: string,
		categoryId: string,
		commentId: string | null
	): Promise<void> => {
		if (!activeFormState.value) return;

		const commentData: RawCommentData = {
			id: commentId,
			commentType: activeFormState.value.commentType,
			categoryId: categoryId,
			filePath: activeFormState.value.filePath,
			content: content,
			startLineNumber: activeFormState.value.startLineNumber || activeFormState.value.lineNumber,
			endLineNumber: activeFormState.value.endLineNumber || activeFormState.value.lineNumber,
		};
		console.log("Upserting comment data:", commentData);

		// Check if we're in reply mode
		if (activeFormState.value.parentCommentId) {
			// Emit reply event
			emit("inline-form-reply", activeFormState.value.parentCommentId, commentData);
		} else {
			// Emit regular submit event
			emit("inline-form-submit", commentData);
		}

		// Hide the form after submission
		hideForm();
	};

	const showForm = (
		commentType: CommentType,
		filePath: string,
		initialContent: string,
		initialCategoryId: string,
		lineNumber: number,
		endLineNumber: number | null = null,
		commentId: string | null = null,
		parentCommentId: string | null = null
	): void => {
		if (!editorView.value) return;

		// Determine start/end line based on comment type
		const startLine = commentType === CommentType.Singleline ? lineNumber : lineNumber;
		const endLine = commentType === CommentType.Multiline ? endLineNumber : null;

		activeFormState.value = {
			lineNumber,
			commentId,
			commentType,
			filePath,
			startLineNumber: startLine,
			endLineNumber: endLine,
			parentCommentId,
		};

		// Dispatch the show form effect to CodeMirror
		editorView.value.dispatch({
			effects: showCommentFormEffect.of({
				lineNumber,
				commentId,
				commentType,
				initialContent,
				initialCategoryId: initialCategoryId,
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

	const findCommentRecursively = (commentId: string, comments: CommentDto[]): CommentDto | null => {
		for (const comment of comments) {
			if (comment.id === commentId) {
				return comment;
			}
			if (comment.replies && comment.replies.length > 0) {
				const found = findCommentRecursively(commentId, comment.replies);
				if (found) return found;
			}
		}
		return null;
	};

	const findRootCommentForReply = (parentCommentId: string): CommentDto | null => {
		// First, find the parent comment recursively
		const parentComment = findCommentRecursively(parentCommentId, props.commentInFile);
		if (!parentComment) return null;

		// If parent has a rootCommentId, find that root comment
		if (parentComment.rootCommentId) {
			return findCommentRecursively(parentComment.rootCommentId, props.commentInFile);
		}

		// Otherwise, the parent IS the root
		return parentComment;
	};

	const handleReplyCommentInline = (parentCommentId: string): void => {
		// Find the root comment for this reply
		const rootComment = findRootCommentForReply(parentCommentId);

		if (!rootComment || !props.filePath) return;

		const lineNumber =
			rootComment.type === CommentType.Singleline
				? rootComment.location.lineNumber!
				: rootComment.location.startLineNumber!;

		const endLineNumber = rootComment.type === CommentType.Multiline ? rootComment.location.endLineNumber : null;

		showForm(
			rootComment.type,
			props.filePath,
			"",
			rootComment.category?.id || projectDataStore.getDefaultCategory.id,
			lineNumber,
			endLineNumber,
			null,
			parentCommentId
		);
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

		showForm(
			CommentType.Singleline,
			filePath,
			existingComment?.content || "",
			existingComment?.category?.id || projectDataStore.getDefaultCategory.id,
			lineNumber,
			null,
			existingComment?.id || null,
			null
		);
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

				showForm(
					CommentType.Multiline,
					props.filePath!,
					existingComment?.content || "",
					existingComment?.category?.id || projectDataStore.getDefaultCategory.id,
					startLineNumber,
					endLineNumber,
					existingComment?.id || null,
					null
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
