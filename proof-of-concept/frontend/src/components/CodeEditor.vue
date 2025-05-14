<template>
	<section class="flex flex-col flex-grow bg-gray-900 text-gray-300">
		<!-- Tab-like display for the open file -->
		<div
			v-if="filePath"
			class="bg-gray-800 text-sm text-gray-300 px-4 py-2 border-b border-t border-gray-900 select-none flex-shrink-0"
		>
			📄 {{ getFileName(filePath) }}
		</div>
		<div
			v-else-if="!filePath && fileContent === null && !isLoadingFile"
			class="no-file-selected-message flex items-center justify-center flex-grow text-gray-500 italic"
		>
			Select a file to view its content.
		</div>

		<div v-if="isLoadingFile && filePath" class="flex items-center justify-center flex-grow">
			<p class="text-center italic text-gray-500 p-5">Loading {{ filePath }}...</p>
		</div>
		<div
			v-else-if="fileContent && fileContent.startsWith('Error loading file:')"
			class="flex items-center justify-center flex-grow"
		>
			<p class="text-center text-red-400 p-5">{{ fileContent }}</p>
		</div>
		<div
			v-else-if="filePath && fileContent !== null"
			class="editor-wrapper flex-grow overflow-hidden"
		>
			<codemirror
				v-model="currentContent"
				:placeholder="editorPlaceholder"
				:style="{ height: '100%' }"
				:autofocus="true"
				:indent-with-tab="true"
				:tab-size="2"
				:extensions="extensions"
				@ready="handleReady"
				@dblclick="handleEditorDoubleClick"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, watch, shallowRef, computed } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { vue } from '@codemirror/lang-vue';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, lineNumbers } from '@codemirror/view';

interface Props {
  fileContent: string | null;
  filePath: string | null;
  isLoadingFile?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['line-double-clicked']);

const currentContent = ref('');
const editorView = shallowRef<EditorView>();

const editorPlaceholder = computed(() => {
  return props.filePath ? `Content of ${props.filePath}` : 'Code will appear here...';
});

const getLanguageExtension = (filePath: string | null) => {
  if (!filePath) return javascript(); // Default
  const extension = filePath.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js': case 'ts': case 'mjs': case 'cjs': return javascript();
    case 'html': case 'htm': return html();
    case 'css': return css();
    case 'vue': return vue();
    case 'json': return json();
    case 'md': return markdown();
    default: return []; // No specific language, or import a plain text extension
  }
};

const extensions = computed(() => {
  const langExt = getLanguageExtension(props.filePath);
  return [
    oneDark,
    lineNumbers(),
    EditorView.lineWrapping,
    ...(Array.isArray(langExt) ? langExt : [langExt]), // Ensure langExt is spread if array (like for plain text)
    EditorView.editable.of(false)
  ];
});

watch(() => props.fileContent, (newVal: string | null) => {
  currentContent.value = newVal === null ? '' : newVal;
}, { immediate: true });


const handleReady = (payload: { view: EditorView }) => {
  editorView.value = payload.view;
};

const handleEditorDoubleClick = (event: MouseEvent) => {
  if (!editorView.value) return;
  const pos = editorView.value.posAtCoords(event);
  if (pos !== null) {
    const line = editorView.value.state.doc.lineAt(pos);
    emit('line-double-clicked', line.number);
  }
};

function getFileName(path: string | null): string {
  if (!path) return '';
  return path.split('/').pop() || path;
}
</script>
