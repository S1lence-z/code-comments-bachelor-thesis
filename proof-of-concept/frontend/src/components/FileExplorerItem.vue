<template>
	<li :style="{ paddingLeft: `${depth * 12}px` }" class="list-none">
		<div
			@click="itemClicked"
			:class="{ 'selected-file': item.path === selectedFile && item.type === 'file' }"
			:title="item.path"
			style="display: flex; align-items: center; padding: 6px 8px; cursor: pointer; font-size: 13px; color: #e2e8f0; border-radius: 4px; margin-bottom: 2px; transition: background-color 0.2s ease-in-out;"
			@mouseover="isHovered = true"
			@mouseleave="isHovered = false"
			:style="{backgroundColor: isHovered ? 'rgba(74, 85, 104, 0.6)' : ''}"
		>
			<span
				v-if="item.type === 'folder'"
				class="mr-1 folder-toggle"
				@click.stop="toggleExpand"
				style="font-size: 12px; color: #cbd5e0;"
			>
				{{ item.isExpanded ? '▼' : '►' }}
			</span>
			<span v-else class="mr-1 icon-placeholder"></span>
			<!-- Placeholder for alignment -->

			<span class="mr-2 item-icon" style="font-size: 14px;">
				<span v-if="item.type === 'folder'">📁</span>
				<span v-else>{{ getFileIcon(item.name) }}</span>
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
import { ref, withDefaults } from 'vue';
import { getFileIcon } from '../utils/fileUtils'
import { TreeNode } from '../types/github';

interface FileExplorerItemProps {
	item: TreeNode;
	selectedFile: string | null;
	depth?: number;
}

const props = withDefaults(defineProps<FileExplorerItemProps>(), {
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

// getFileIcon is now imported from fileUtils
</script>

<style scoped>
.selected-file {
	background-color: rgba(74, 85, 104, 0.8);
	color: white;
}
/* Add styles for folder-toggle and icon-placeholder if they are not globally defined */
.folder-toggle {
  width: 1em; /* Ensure it takes up space for alignment */
  text-align: center;
}
.icon-placeholder {
  width: 1em; /* Ensure it takes up space for alignment */
  display: inline-block; /* Make sure it occupies space */
}
.mr-1 {
  margin-right: 0.25rem;
}
.mr-2 {
  margin-right: 0.5rem;
}
.list-none {
  list-style-type: none;
}
.pl-0 {
  padding-left: 0;
}
.m-0 {
  margin: 0;
}
</style>
