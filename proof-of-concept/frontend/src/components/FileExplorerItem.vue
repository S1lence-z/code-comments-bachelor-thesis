<template>
	<li :style="{ paddingLeft: `${depth * 15}px` }" class="list-none">
		<div
			@click="itemClicked"
			:class="{ 'selected-file': item.path === selectedFile && item.type === 'file' }"
			:title="item.path"
			style="display: flex; align-items: center; padding: 8px 12px; cursor: pointer; font-size: 14px; color: #a3a3a3; border: 1px solid #4a5568; border-radius: 6px; margin-bottom: 4px; transition: background-color 0.2s ease-in-out; background-color: #2d3748; "
			@mouseover="isHovered = true"
			@mouseleave="isHovered = false"
			:style="{backgroundColor: isHovered ? '#4a5568' : ''}"
		>
			<span
				v-if="item.type === 'folder'"
				class="mr-1 folder-toggle"
				@click.stop="toggleExpand"
			>
				{{ item.isExpanded ? '▼' : '►' }}
			</span>
			<span v-else class="mr-1 icon-placeholder"></span>
			<!-- Placeholder for alignment -->

			<span class="mr-2 item-icon">
				<span v-if="item.type === 'folder'">📁</span>
				<span v-else>{{ getFileIcon() }}</span>
			</span>
			<span
				class="item-name"
				style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
				>{{ item.name }}</span
			>
		</div>
		<ul
			v-if="item.type === 'folder' && item.isExpanded && item.children && item.children.length > 0"
			class="pl-0 list-none m-0"
		>
			<FileExplorerItem
				v-for="child in item.children"
				:key="child.path"
				:item="child"
				:selectedFile="selectedFile"
				:depth="depth + 1"
				@file-selected="$emit('file-selected', $event)"
				@toggle-expand-item="$emit('toggle-expand-item', $event)"
			/>
		</ul>
	</li>
</template>

<script setup lang="ts">
import type { TreeNode } from '../types/github';
import { ref } from 'vue';

interface Props {
  item: TreeNode;
  selectedFile: string | null;
  depth?: number;
}
const props = withDefaults(defineProps<Props>(), {
  depth: 0,
});

const emit = defineEmits(['file-selected', 'toggle-expand-item']);
const isHovered = ref(false);

function itemClicked() {
  if (props.item.type === 'file') {
	emit('file-selected', props.item.path);
  } else if (props.item.type === 'folder') {
	// Clicking folder name also toggles
	emit('toggle-expand-item', props.item);
  }
}

function toggleExpand() { // Specifically for the folder icon click
  if (props.item.type === 'folder') {
	emit('toggle-expand-item', props.item);
  }
}

function getFileIcon(): string {
  return '📄';
}
</script>

<style scoped>
.selected-file {
	background-color: #4a5568;
	color: white;
}
</style>
