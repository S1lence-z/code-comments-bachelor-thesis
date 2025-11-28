<script setup lang="ts">
import "../../assets/css/commentTools.css";
import "../../assets/css/commentWidget.css";
import { Codemirror } from "vue-codemirror";
import { useCodeEditor, type CodeEditorProps, type CodeEditorEmits } from "../../composables/code-review/useCodeEditor";
import { Icon } from "@iconify/vue";

const { t } = useI18n();

const props = defineProps<CodeEditorProps>();
const emit = defineEmits<CodeEditorEmits>();

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
	<section class="flex flex-col grow h-full bg-gray-800 text-gray-300">
		<div
			v-if="props.filePath && !props.fileContent"
			class="flex items-center justify-center grow"
		>
			<p class="text-center italic text-gray-400 p-5">Loading {{ props.filePath }}...</p>
		</div>
		<div
			v-else-if="props.fileContent && props.fileContent.startsWith('Error loading file:')"
			class="flex items-center justify-center grow"
		>
			<p class="text-center text-rose-500 p-5">{{ props.fileContent }}</p>
		</div>
		<div
			v-else-if="props.filePath && props.fileContent !== null"
			class="grow relative overflow-auto scrollbar-hidden"
		>
			<div
				v-if="isKeyboardMode"
				class="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 text-xs font-semibold z-10 pointer-events-none"
			>
				<div class="flex items-center gap-2">
					<Icon icon="mdi:keyboard" class="w-5 h-5" />
					<p class="text-base">{{ t("codeEditor.keyboardMode") }}</p>
				</div>
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
