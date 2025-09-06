<script setup lang="ts">
import "../../../css/codemirror.css";
import { Codemirror } from "vue-codemirror";
import type CommentDto from "../../types/dtos/CommentDto";
import { useCodeEditor } from "../../composables/components/useCodeEditor";

interface CodeEditorProps {
	filePath: string | null;
	fileContent: string | null | undefined;
	isLoadingFile: boolean;
	commentForFile: CommentDto[];
	deleteCommentAction: (commentId: string) => Promise<void>;
	editCommentAction: (commentId: string) => Promise<void>;
}

const props = withDefaults(defineProps<CodeEditorProps>(), {
	isLoadingFile: false,
	commentForFile: () => [],
});

const emit = defineEmits<{
	"line-double-clicked": [{ lineNumber: number; filePath: string }];
	"multiline-selected": [{ selectedStartLineNumber: number; selectedEndLineNumber: number; filePath: string }];
}>();

// Initialize the composable
const {
	// State
	currentContent,

	// Computed
	editorPlaceholder,
	extensions,
	isKeyboardMode,

	// Methods
	handleCodemirrorReady,
	handleEditorDoubleClick,
} = useCodeEditor(props, emit);
</script>

<template>
	<section class="flex flex-col flex-grow h-full bg-gray-800 text-gray-300">
		<div
			v-if="!props.filePath && props.fileContent === null && !props.isLoadingFile"
			class="flex items-center justify-center flex-grow text-gray-400 italic"
		>
			Select a file to view its content.
		</div>

		<div v-if="props.isLoadingFile && props.filePath" class="flex items-center justify-center flex-grow">
			<p class="text-center italic text-gray-400 p-5">Loading {{ props.filePath }}...</p>
		</div>
		<div
			v-else-if="props.fileContent && props.fileContent.startsWith('Error loading file:')"
			class="flex items-center justify-center flex-grow"
		>
			<p class="text-center text-rose-500 p-5">{{ props.fileContent }}</p>
		</div>
		<div
			v-else-if="props.filePath && props.fileContent !== null"
			class="flex-grow relative overflow-auto scrollbar-hidden"
		>
			<div
				v-if="isKeyboardMode"
				class="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 text-xs font-semibold z-10 pointer-events-none"
			>
				🎹 Keyboard Navigation Mode
			</div>
			<codemirror
				v-model="currentContent"
				:placeholder="editorPlaceholder"
				:style="{ height: '100%' }"
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
