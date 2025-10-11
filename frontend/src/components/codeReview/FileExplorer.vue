<script setup lang="ts">
import FileExplorerItem from "./FileExplorerItem.vue";
import type { FileExplorerProps, FileExplorerEmits } from "../../composables/codeReview/useFileExplorer.ts";
import { useFileExplorer } from "../../composables/codeReview/useFileExplorer.ts";

const props = defineProps<FileExplorerProps>();
const emit = defineEmits<FileExplorerEmits>();

const { projectCommentButtonLabel, expandAllButtonLabel, handleToggleExpandInTree, expandAllFiles } = useFileExplorer();
</script>

<template>
	<aside class="h-full flex flex-col backdrop-blur-sm">
		<div class="flex bg-white/5 backdrop-blur-sm py-3 space-x-2 justify-around border-b border-white/10">
			<!-- Toggle Expand All Button -->
			<button class="btn-secondary rounded-lg p-2 text-sm cursor-pointer font-semibold" @click="expandAllFiles">
				{{ expandAllButtonLabel }}
			</button>

			<!-- Project Comment Button -->
			<button
				class="btn-primary rounded-lg p-2 text-sm cursor-pointer font-semibold"
				@click="emit('project-comment-requested')"
			>
				{{ projectCommentButtonLabel }}
			</button>
		</div>

		<!-- File Tree -->
		<div class="flex-1 overflow-y-auto scrollbar-hidden bg-white/10">
			<ul class="p-2 space-y-1">
				<FileExplorerItem
					v-for="item in props.treeData"
					:key="item.path"
					:currentNode="item"
					:filePath="props.selectedPath"
					@update:filePath="(filePath) => emit('update:selectedPath', filePath)"
					@toggle-expand-item="handleToggleExpandInTree(item, props.treeData)"
					@file-comment-requested="(filePath) => emit('file-comment-requested', filePath)"
				/>
			</ul>
		</div>
	</aside>
</template>
