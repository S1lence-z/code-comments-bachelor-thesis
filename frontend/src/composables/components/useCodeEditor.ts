import { ref, computed, watch, shallowRef } from "vue";
import { EditorView } from "@codemirror/view";
import { createEditorExtensions } from "../../codeMirror/configs/editorConfig";
import { useSettingsStore } from "../../stores/settingsStore";
import { useKeyboardShortcutsStore } from "../../stores/keyboardShortcutsStore";
import type CommentDto from "../../types/dtos/CommentDto";

interface CodeEditorProps {
	filePath: string | null;
	fileContent: string | null | undefined;
	deleteCommentAction: (commentId: string) => Promise<void>;
	editCommentAction: (commentId: string) => Promise<void>;
	commentForFile: CommentDto[];
}

interface CodeEditorEmits {
	(event: "line-double-clicked", payload: { lineNumber: number; filePath: string }): void;
	(
		event: "multiline-selected",
		payload: { selectedStartLineNumber: number; selectedEndLineNumber: number; filePath: string }
	): void;
}

export function useCodeEditor(props: CodeEditorProps, emit: CodeEditorEmits) {
	// Store access
	const settingsStore = useSettingsStore();
	const keyboardShortcutsStore = useKeyboardShortcutsStore();

	// Local state
	const currentContent = ref<string>("");
	const editorView = shallowRef<EditorView>();
	const lastSelectionTimeout = ref<number | null>(null);

	// Computed properties
	const editorPlaceholder = computed(() => {
		return props.filePath ? `Content of ${props.filePath}` : "Code will appear here...";
	});

	const isKeyboardMode = computed(() => settingsStore.isKeyboardMode);

	const extensions = computed(() => {
		const currentFileComments = props.commentForFile;
		return createEditorExtensions(
			props.filePath,
			currentFileComments,
			settingsStore.isKeyboardMode,
			settingsStore.isCompactCommentWidget,
			keyboardShortcutsStore.getShortcuts,
			props.deleteCommentAction,
			props.editCommentAction,
			handleSingleLineComment
		);
	});

	// Internal methods
	const handleSingleLineComment = (lineNumber: number, filePath: string): void => {
		emit("line-double-clicked", { lineNumber, filePath });
	};

	const handleCodemirrorReady = (payload: any): void => {
		editorView.value = payload.view;

		// Add event listeners for selection change
		if (editorView.value) {
			editorView.value.dom.addEventListener("mouseup", handleSelectionChange);
			editorView.value.dom.addEventListener("keyup", handleSelectionChange);
		}
	};

	const handleEditorDoubleClick = (event: MouseEvent): void => {
		if (!editorView.value) return;

		const pos = editorView.value.posAtCoords({ x: event.clientX, y: event.clientY });
		if (pos !== null && pos !== undefined) {
			const lineNumber = editorView.value.state.doc.lineAt(pos).number;
			if (props.filePath) {
				emit("line-double-clicked", { lineNumber, filePath: props.filePath });
			}
		}
	};

	const handleSelectionChange = (): void => {
		if (!editorView.value) return;
		if (lastSelectionTimeout.value) {
			clearTimeout(lastSelectionTimeout.value);
		}

		// Debounce the selection change to avoid too many events
		lastSelectionTimeout.value = window.setTimeout(() => {
			if (!editorView.value) return;

			const selection = editorView.value.state.selection.main;
			if (selection.empty) return;

			const startLineNumber = editorView.value.state.doc.lineAt(selection.from).number;
			const endLineNumber = editorView.value.state.doc.lineAt(selection.to).number;

			if (startLineNumber !== endLineNumber && props.filePath) {
				emit("multiline-selected", {
					selectedStartLineNumber: startLineNumber,
					selectedEndLineNumber: endLineNumber,
					filePath: props.filePath,
				});
			}
		}, 300);
	};

	const cleanup = (): void => {
		if (lastSelectionTimeout.value) {
			clearTimeout(lastSelectionTimeout.value);
			lastSelectionTimeout.value = null;
		}
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
		editorView,

		// Computed
		editorPlaceholder,
		extensions,
		isKeyboardMode,

		// Methods
		handleCodemirrorReady,
		handleEditorDoubleClick,
		handleSelectionChange,
		cleanup,
	};
}
