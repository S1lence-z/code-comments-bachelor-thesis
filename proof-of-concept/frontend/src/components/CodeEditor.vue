<template>
	<section class="code-editor-container">
		<!-- Tab-like display for the open file -->
		<div v-if="filePath" class="file-path-display">📄 {{ getFileName(filePath) }}</div>
		<div
			v-else-if="!filePath && fileContent === null && !isLoadingFile"
			class="no-file-selected-message"
		>
			Select a file to view its content.
		</div>

		<div v-if="isLoadingFile && filePath" class="loading-message">
			<p class="loading-text">Loading {{ filePath }}...</p>
		</div>
		<div
			v-else-if="fileContent && fileContent.startsWith('Error loading file:')"
			class="error-message"
		>
			<p class="error-text">{{ fileContent }}</p>
		</div>
		<div v-else-if="filePath && fileContent !== null" class="editor-wrapper">
			<codemirror
				v-model="currentContent"
				:placeholder="editorPlaceholder"
				:style="{ height: '100%', overflow: 'auto' }"
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
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';
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
	case 'py': return python();
	case 'sql': return sql();
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
	// Print the line number of the double-clicked line
	const lineNumber = editorView.value?.state.doc.lineAt(event.clientY).number;
	console.log(`Double-clicked line number: ${lineNumber}`);
	emit('line-double-clicked', lineNumber);
};

function getFileName(path: string | null): string {
  if (!path) return '';
  return path.split('/').pop() || path;
}
</script>

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
	overflow: hidden;
}
</style>
