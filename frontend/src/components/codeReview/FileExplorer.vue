<script setup lang="ts">
import FileExplorerItem from "./FileExplorerItem.vue";
import { handleToggleExpandInTree } from "../../utils/treeNodeUtils.ts";
import type { TreeNode } from "../../types/github/githubTree";

interface FileExplorerProps {
	treeData: TreeNode[];
	selectedPath: string | null;
	projectCommentButtonLabel: string;
	expandAllButtonLabel: string;
}

interface FileExplorerEmits {
	(event: "update:selectedPath", value: string | null): void;
	(event: "project-comment-requested"): void;
	(event: "file-comment-requested", filePath: string): void;
	(event: "toggle-expand-all-items"): void;
}

const props = defineProps<FileExplorerProps>();
const emit = defineEmits<FileExplorerEmits>();
</script>

<template>
	<aside class="h-full flex flex-col backdrop-blur-sm">
		<div class="flex bg-white/5 backdrop-blur-sm py-3 space-x-2 justify-around border-b border-white/10">
			<!-- Toggle Expand All Button -->
			<button
				class="btn-secondary rounded-lg p-2 text-sm cursor-pointer font-semibold"
				@click="emit('toggle-expand-all-items')"
			>
				{{ props.expandAllButtonLabel }}
			</button>

			<!-- Project Comment Button -->
			<button
				class="btn-primary rounded-lg p-2 text-sm cursor-pointer font-semibold"
				@click="emit('project-comment-requested')"
			>
				{{ props.projectCommentButtonLabel }}
			</button>
		</div>

		<!-- File Tree -->
		<div class="flex-1 overflow-y-auto scrollbar-hidden bg-white/10">
			<ul class="p-2 space-y-1">
				<FileExplorerItem
					v-for="item in props.treeData"
					:key="item.path"
					:item="item"
					:filePath="props.selectedPath"
					@update:filePath="(filePath) => emit('update:selectedPath', filePath)"
					@toggle-expand-item="handleToggleExpandInTree(item, props.treeData)"
					@file-comment-requested="(filePath) => emit('file-comment-requested', filePath)"
				/>
			</ul>
		</div>
	</aside>
</template>
