<script setup lang="ts">
import FileExplorerItem from "./FileExplorerItem.vue";
import type { TreeNode } from "../../types/githubTree.ts";
import { handleToggleExpandInTree } from "../../utils/treeNodeUtils.ts";

interface Props {
	treeData: TreeNode[];
	selectedPath: string | null;
}
defineProps<Props>();

defineEmits<{
	(event: "update:selectedPath", value: string | null): void;
}>();
</script>

<template>
	<aside class="h-full flex flex-col bg-white/10 backdrop-blur-sm">
		<!-- Header -->
		<div class="bg-white/5 backdrop-blur-sm border-b border-white/10 px-6 py-4">
			<h2 class="text-white font-semibold uppercase">Explorer</h2>
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
