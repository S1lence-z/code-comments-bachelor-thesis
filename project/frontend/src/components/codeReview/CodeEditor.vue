<script setup lang="ts">
import { ref, watch, shallowRef, computed, inject } from "vue";
import { Codemirror } from "vue-codemirror";
import { EditorView } from "@codemirror/view";
import type ICommentDto from "../../types/interfaces/ICommentDto";
import { createEditorExtensions } from "../../codeMirror/configs/editorConfig";
import "../../../css/codemirror.css";
import { keyboardModeContextKey } from "../../core/keys";

const keyboardModeContext = inject(keyboardModeContextKey, {
	isKeyboardMode: ref(false),
});

interface CodeEditorProps {
	filePath: string | null;
	fileContent: string | null | undefined;
	deleteCommentAction: (commentId: string) => Promise<void>;
	editCommentAction: (commentId: string) => Promise<void>;
	isLoadingFile?: boolean;
	comments?: ICommentDto[];
}

const props = withDefaults(defineProps<CodeEditorProps>(), {
	isLoadingFile: false,
	comments: () => [],
});

const emit = defineEmits<{
	"line-double-clicked": [{ lineNumber: number; filePath: string }];
	"multiline-selected": [{ selectedStartLineNumber: number; selectedEndLineNumber: number; filePath: string }];
}>();

const currentContent = ref<string>("");
const editorView = shallowRef<EditorView>();
const lastSelectionTimeout = ref<number | null>(null);

// Callback functions for keyboard shortcuts
const handleSingleLineComment = (lineNumber: number, filePath: string) => {
	emit("line-double-clicked", { lineNumber, filePath });
};

const editorPlaceholder = computed(() => {
	return props.filePath ? `Content of ${props.filePath}` : "Code will appear here...";
});

const extensions = computed(() => {
	const currentFileComments = props.comments || [];
	return createEditorExtensions(
		props.filePath,
		currentFileComments,
		props.deleteCommentAction,
		props.editCommentAction,
		keyboardModeContext.isKeyboardMode.value,
		handleSingleLineComment
	);
});

watch(
	() => props.fileContent,
	(newVal: string | null | undefined) => {
		currentContent.value = newVal ?? "";
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
		const lineNumber = editorView.value.state.doc.lineAt(pos).number;
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
			emit("multiline-selected", {
				selectedStartLineNumber: startLineNumber,
				selectedEndLineNumber: endLineNumber,
				filePath: props.filePath,
			});
		}
	}, 300);
};
</script>

<template>
	<section class="flex flex-col flex-grow h-full bg-gray-800 text-gray-300">
		<div
			v-if="!filePath && fileContent === null && !isLoadingFile"
			class="flex items-center justify-center flex-grow text-gray-400 italic"
		>
			Select a file to view its content.
		</div>

		<div v-if="isLoadingFile && filePath" class="flex items-center justify-center flex-grow">
			<p class="text-center italic text-gray-400 p-5">Loading {{ filePath }}...</p>
		</div>
		<div
			v-else-if="fileContent && fileContent.startsWith('Error loading file:')"
			class="flex items-center justify-center flex-grow"
		>
			<p class="text-center text-rose-500 p-5">{{ fileContent }}</p>
		</div>
		<div v-else-if="filePath && fileContent !== null" class="flex-grow relative overflow-auto scrollbar-hidden">
			<div
				v-if="keyboardModeContext.isKeyboardMode.value"
				class="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 text-xs font-semibold z-10 pointer-events-none"
			>
				🎹 Keyboard Navigation Mode
			</div>
			<codemirror
				v-model="currentContent"
				:placeholder="editorPlaceholder"
				:style="{ height: '100%' }"
				:autofocus="keyboardModeContext.isKeyboardMode.value"
				:indent-with-tab="true"
				:tab-size="2"
				:extensions="extensions"
				@ready="handleCodemirrorReady"
				@dblclick="handleEditorDoubleClick"
			/>
		</div>
	</section>
</template>
