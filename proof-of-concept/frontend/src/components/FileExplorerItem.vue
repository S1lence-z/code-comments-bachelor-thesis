<template>
	<li :style="{ paddingLeft: `${depth * 15}px` }" class="list-none">
		<div
			@click="itemClicked"
			:class="[
          'group flex items-center px-2 py-1 cursor-pointer hover:bg-[#2a2d2e] text-sm whitespace-nowrap rounded-sm',
          { 'bg-[#37373d] !text-white': item.path === selectedFile && item.type === 'file' }
        ]"
			:title="item.path"
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
				<span v-else>{{ getFileIcon(item.name) }}</span>
			</span>
			<span
				class="item-name flex-grow overflow-hidden text-ellipsis whitespace-nowrap"
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

interface Props {
  item: TreeNode;
  selectedFile: string | null;
  depth?: number;
}
const props = withDefaults(defineProps<Props>(), {
  depth: 0,
});

const emit = defineEmits(['file-selected', 'toggle-expand-item']);

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

function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'js' || ext === 'ts') return 'JS';
  if (ext === 'vue') return 'V';
  if (ext === 'html') return 'H';
  if (ext === 'css') return 'C';
  if (ext === 'json') return 'JSN';
  if (ext === 'md') return 'MD';
  return '📄';
}
</script>
