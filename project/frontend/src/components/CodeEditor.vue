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
import { ref, watch, shallowRef, computed, withDefaults } from 'vue';
import { oneDark } from '@codemirror/theme-one-dark';
import { Codemirror } from 'vue-codemirror';
import { EditorView, lineNumbers, Decoration, WidgetType } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import { RangeSetBuilder, StateField, EditorState } from '@codemirror/state';
import { getLanguageExtension } from '../utils/languageUtils';
import ICommentDto from '../../../shared/dtos/ICommentDto';

interface CodeEditorProps {
	fileContent: string | null;
	filePath: string | null;
	isLoadingFile?: boolean;
	comments?: ICommentDto[];
}

const props = withDefaults(defineProps<CodeEditorProps>(), {
  isLoadingFile: false,
  comments: () => []
});

const emit = defineEmits<{
  'line-double-clicked': [{ lineNumber: number, filePath: string }];
}>();

const currentContent = ref('');
const editorView = shallowRef<EditorView>();

const editorPlaceholder = computed(() => {
  return props.filePath ? `Content of ${props.filePath}` : 'Code will appear here...';
});

class CommentWidget extends WidgetType {
  constructor(readonly text: string) { super(); }

  toDOM() {
    const wrap = document.createElement('div');
    wrap.className = 'cm-comment-widget';
    wrap.textContent = this.text;
    return wrap;
  }

  ignoreEvent() { return false; }
}

function buildDecorations(state: EditorState, commentsToDisplay: Readonly<ICommentDto[]>): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  if (!commentsToDisplay || commentsToDisplay.length === 0) {
    return builder.finish();
  }

  for (const comment of commentsToDisplay) {
    if (comment.lineNumber > 0 && comment.lineNumber <= state.doc.lines) {
      const line = state.doc.line(comment.lineNumber);
      builder.add(line.from, line.from, Decoration.widget({
        widget: new CommentWidget(comment.content),
        side: -1, // Place widget before the line's actual content start
        block: true,
      }));
    }
  }
  return builder.finish();
}

function commentsDisplayExtension(currentComments: Readonly<ICommentDto[]>) {
  return StateField.define<DecorationSet>({
    create(state: EditorState) {
      return buildDecorations(state, currentComments);
    },
    update(value: DecorationSet, tr) {
      if (tr.docChanged) {
        return buildDecorations(tr.state, currentComments);
      }
      return value.map(tr.changes);
    },
    provide: f => EditorView.decorations.from(f)
  });
}

const extensions = computed(() => {
  const langExt = getLanguageExtension(props.filePath);
  const currentFileComments = props.comments || []; // Ensure it's an array
  console.log('CodeEditor.vue: `extensions` computed property re-evaluated. Comments count:', currentFileComments.length); // DEBUG
  if (currentFileComments.length > 0) {
    // console.log('Current comments in extensions:', JSON.stringify(currentFileComments)); // Can be verbose
  }

  return [
    oneDark,
    lineNumbers(),
    EditorView.lineWrapping,
    ...(Array.isArray(langExt) ? langExt : [langExt]),
    EditorView.editable.of(false),
    commentsDisplayExtension(currentFileComments) // Pass the reactive comments array
  ];
});

watch(() => props.fileContent, (newVal: string | null) => {
  currentContent.value = newVal === null ? '' : newVal;
}, { immediate: true });

const handleReady = (payload: { view: EditorView; state: EditorState; container: HTMLDivElement }): void => {
	editorView.value = payload.view;
};

const handleEditorDoubleClick = (event: MouseEvent) => {
	if (!editorView.value) return;
	// Use posAtCoords to get the precise character position from mouse coordinates
	const pos = editorView.value.posAtCoords({ x: event.clientX, y: event.clientY });
	if (pos !== null && pos !== undefined) {
		const lineNumber = editorView.value.state.doc.lineAt(pos).number; // lineNumber is 1-based
		if (props.filePath) { // Ensure filePath is not null
			emit('line-double-clicked', { lineNumber, filePath: props.filePath });
		}
	}
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
	overflow: auto; /* Ensures scrolling is enabled */
}

/* Deep selector for CodeMirror generated comment widget */
:deep(.cm-comment-widget) {
	background-color: #2c3e50; /* Darker blue-gray */
	color: #ecf0f1; /* Light gray/white */
	padding: 5px 10px;
	margin-bottom: 4px;
	font-size: 0.88em;
	white-space: pre-wrap;
	border-radius: 4px;
	border-left: 3px solid #3498db; /* Blue accent line */
	box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	line-height: 1.4;
}
</style>
