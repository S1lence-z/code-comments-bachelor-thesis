<script setup lang="ts">
import FileExplorerItem from "./FileExplorerItem.vue";
import { handleToggleExpandInTree } from "../../utils/treeNodeUtils.ts";
import {
	useFileExplorer,
	type FileExplorerProps,
	type FileExplorerEmits,
} from "../../composables/components/useFileExplorer";

const props = defineProps<FileExplorerProps>();
const emit = defineEmits<FileExplorerEmits>();

// Initialize the composable
const {
	// Methods
	handleProjectCommentAction,
	handleFileCommentAction,
	handleFileSelection,
} = useFileExplorer(props, emit);
</script>

<template>
	<aside class="h-full flex flex-col bg-white/10 backdrop-blur-sm">
		<!-- Header -->
		<div class="bg-white/5 backdrop-blur-sm border-b border-white/10 px-4 py-4 flex items-center justify-between">
			<h2 class="text-white font-semibold uppercase">Explorer</h2>
			<button class="btn btn-primary text-xs" @click="handleProjectCommentAction">
				{{ props.projectCommentButtonLabel }}
			</button>
		</div>

		<!-- File Tree -->
		<div class="flex-1 overflow-y-auto scrollbar-hidden">
			<ul class="p-2 space-y-1">
				<FileExplorerItem
					v-for="item in props.treeData"
					:key="item.path"
					:item="item"
					:filePath="props.selectedPath"
					@update:filePath="handleFileSelection"
					@toggle-expand-item="handleToggleExpandInTree(item, props.treeData)"
					@file-comment-requested="handleFileCommentAction"
				/>
			</ul>
		</div>
	</aside>
</template>
