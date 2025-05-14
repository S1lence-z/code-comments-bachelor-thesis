<template>
	<aside class="explorer-container">
		<div class="explorer-header">Explorer</div>
		<ul class="file-tree-list">
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
.explorer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #252526;
  color: gray-300;
  overflow-y: auto;
  user-select: none;
}

.explorer-header {
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: gray;
  text-transform: uppercase;
  letter-spacing: .05em;
  border-bottom: 1px solid #333333;
}

.file-tree-list {
  flex: 1;
  list-style: none;
  padding: 4px;
}

.select-none {
  user-select: none;
}
</style>
