<script setup lang="ts">
import { ref, watch, shallowRef, computed, inject, type Ref } from "vue";
import { Codemirror } from "vue-codemirror";
import { EditorView } from "@codemirror/view";
import type ICommentDto from "../../../shared/dtos/ICommentDto";
import "../codemirror/styles.css";
import { createEditorExtensions } from "../codeMirror/configs/editorConfig";

const isKeyboardMode = inject("isKeyboardMode") as Ref<boolean>;

interface CodeEditorProps {
	fileContent: string | null;
	filePath: string | null;
	isLoadingFile?: boolean;
	comments?: ICommentDto[];
	deleteCommentAction: (commentId: number) => Promise<void>;
}

const props = withDefaults(defineProps<CodeEditorProps>(), {
	isLoadingFile: false,
	comments: () => [],
});

const emit = defineEmits<{
	"line-double-clicked": [{ lineNumber: number; filePath: string }];
	"multiline-selected": [{ startLineNumber: number; endLineNumber: number; filePath: string }];
}>();

const currentContent = ref("");
const editorView = shallowRef<EditorView>();
const lastSelectionTimeout = ref<number | null>(null);

// Callback functions for keyboard shortcuts
const handleSingleLineComment = (lineNumber: number, filePath: string) => {
	emit("line-double-clicked", { lineNumber, filePath });
};

function getFileName(path: string | null): string {
	if (!path) return "";
	return path.split("/").pop() || path;
}

const editorPlaceholder = computed(() => {
	return props.filePath ? `Content of ${props.filePath}` : "Code will appear here...";
});

const extensions = computed(() => {
	const currentFileComments = props.comments || [];
	return createEditorExtensions(
		props.filePath,
		currentFileComments,
		props.deleteCommentAction,
		isKeyboardMode.value,
		handleSingleLineComment
	);
});

watch(
	() => props.fileContent,
	(newVal: string | null) => {
		currentContent.value = newVal === null ? "" : newVal;
	},
	{ immediate: true }
);

const handleCodemirrorReady = (payload: any): any => {
	editorView.value = payload.view;

	// Add event listeners selection change
	if (editorView.value) {
		editorView.value.dom.addEventListener("mouseup", handleSelectionChange);
		editorView.value.dom.addEventListener("keyup", handleSelectionChange);
	}
};

const handleEditorDoubleClick = (event: MouseEvent) => {
	if (!editorView.value) return;

	const pos = editorView.value.posAtCoords({ x: event.clientX, y: event.clientY });
	if (pos !== null && pos !== undefined) {
		const lineNumber = editorView.value.state.doc.lineAt(pos).number; // lineNumber is 1-based
		if (props.filePath) {
			emit("line-double-clicked", { lineNumber, filePath: props.filePath });
		}
	}
};

// Multiline selection handling
const handleSelectionChange = () => {
	if (!editorView.value) return;
	if (lastSelectionTimeout.value) {
		clearTimeout(lastSelectionTimeout.value);
	}

	// Debounce the selection change to avoid too many events
	lastSelectionTimeout.value = window.setTimeout(() => {
		const selection = editorView.value!.state.selection.main;
		if (selection.empty) return;

		const startLineNumber = editorView.value!.state.doc.lineAt(selection.from).number;
		const endLineNumber = editorView.value!.state.doc.lineAt(selection.to).number;

		if (startLineNumber !== endLineNumber && props.filePath) {
			emit("multiline-selected", { startLineNumber, endLineNumber, filePath: props.filePath });
		}
	}, 300);
};
</script>

<template>
	<section class="code-editor-container">
		<div v-if="filePath" class="file-path-display">📄 {{ getFileName(filePath) }}</div>
		<div v-else-if="!filePath && fileContent === null && !isLoadingFile" class="no-file-selected-message">
			Select a file to view its content.
		</div>

		<div v-if="isLoadingFile && filePath" class="loading-message">
			<p class="loading-text">Loading {{ filePath }}...</p>
		</div>
		<div v-else-if="fileContent && fileContent.startsWith('Error loading file:')" class="error-message">
			<p class="error-text">{{ fileContent }}</p>
		</div>
		<div
			v-else-if="filePath && fileContent !== null"
			class="editor-wrapper"
			:class="{ 'keyboard-mode': isKeyboardMode }"
		>
			<div v-if="isKeyboardMode" class="keyboard-mode-indicator">🎹 Keyboard Navigation Mode</div>
			<codemirror
				v-model="currentContent"
				:placeholder="editorPlaceholder"
				:style="{ height: '100%', overflow: 'auto' }"
				:autofocus="isKeyboardMode"
				:indent-with-tab="true"
				:tab-size="2"
				:extensions="extensions"
				@ready="handleCodemirrorReady"
				@dblclick="handleEditorDoubleClick"
			/>
		</div>
	</section>
</template>

<style scoped>
.code-editor-container {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	background-color: #1f2937;
	color: #d1d5db;
}

.file-path-display {
	background-color: #2d3748;
	font-size: 0.875rem;
	color: #d1d5db;
	padding: 0.5rem 1rem;
	border-bottom: 1px solid #1f2937;
	border-top: 1px solid #1f2937;
	-webkit-user-select: none; /* Safari */
	-ms-user-select: none; /* IE 10+ */
	user-select: none;
	flex-shrink: 0;
}

.no-file-selected-message {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-grow: 1;
	color: #9ca3af;
	font-style: italic;
}

.loading-message {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-grow: 1;
}

.loading-text {
	text-align: center;
	font-style: italic;
	color: #9ca3af;
	padding: 1.25rem;
}

.error-message {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-grow: 1;
}

.error-text {
	text-align: center;
	color: #f43f5e;
	padding: 1.25rem;
}

.editor-wrapper {
	flex-grow: 1;
	overflow: auto; /* Ensures scrolling is enabled */
	position: relative;
}

.editor-wrapper.keyboard-mode {
	border: 2px solid #007acc;
	border-radius: 4px;
}

.keyboard-mode-indicator {
	position: absolute;
	top: 8px;
	right: 8px;
	background-color: #007acc;
	color: white;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 0.75rem;
	font-weight: 600;
	z-index: 10;
	pointer-events: none;
}
</style>
