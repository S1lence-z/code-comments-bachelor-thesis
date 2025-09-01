<script setup lang="ts">
import FileExplorerItem from "./FileExplorerItem.vue";
import type { TreeNode } from "../../types/github/githubTree.ts";
import { handleToggleExpandInTree } from "../../utils/treeNodeUtils.ts";

interface FileExplorerProps {
	treeData: TreeNode[];
	selectedPath: string | null;
	getProjectCommentButtonLabel: () => string;
}
defineProps<FileExplorerProps>();

const emit = defineEmits<{
	(event: "update:selectedPath", value: string | null): void;
	(event: "onChangeProjectComment"): void;
}>();
</script>

<template>
	<aside class="h-full flex flex-col bg-white/10 backdrop-blur-sm">
		<!-- Header -->
		<div class="bg-white/5 backdrop-blur-sm border-b border-white/10 px-4 py-4 flex items-center justify-between">
			<h2 class="text-white font-semibold uppercase">Explorer</h2>
			<button class="btn btn-primary text-xs" @click="emit('onChangeProjectComment')">
				{{ getProjectCommentButtonLabel() }}
			</button>
		</div>

		<!-- File Tree -->
		<div class="flex-1 overflow-y-auto scrollbar-hidden">
			<ul class="p-2 space-y-1">
				<FileExplorerItem
					v-for="item in treeData"
					:key="item.path"
					:item="item"
					:filePath="selectedPath"
					@update:filePath="$emit('update:selectedPath', $event)"
					@toggle-expand-item="handleToggleExpandInTree(item, treeData)"
				/>
			</ul>
		</div>
	</aside>
</template>
