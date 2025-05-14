<template>
	<aside class="h-full flex flex-col bg-[#252526] text-gray-300 overflow-y-auto select-none">
		<div
			class="explorer-header px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-[#333333]"
		>
			Explorer
		</div>
		<ul class="flex-1 file-tree-list p-1">
			<FileExplorerItem
				v-for="item in treeData"
				:key="item.path"
				:item="item"
				:selectedFile="selectedFile"
				@file-selected="$emit('file-selected', $event)"
				@toggle-expand-item="handleToggleExpand"
			/>
		</ul>
	</aside>
</template>

<script setup lang="ts">
import FileExplorerItem from './FileExplorerItem.vue';
import type { TreeNode } from '../types/github';

interface Props {
  treeData: TreeNode[];
  selectedFile: string | null;
}
defineProps<Props>();

const emit = defineEmits(['file-selected', 'toggle-expand-item']);

function handleToggleExpand(item: TreeNode) {
  emit('toggle-expand-item', item);
}
</script>

<style scoped>
/* Styles can be minimal as FileExplorerItem handles item styling */
.file-tree-list {
  list-style: none;
  padding: 4px; /* Small padding around the list */
}
.select-none {
  user-select: none;
}
</style>
