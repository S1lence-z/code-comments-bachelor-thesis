<script setup lang="ts">
import FileExplorerItem from "./FileExplorerItem.vue";
import type { TreeNode } from "../types/githubApi.ts";

interface Props {
	treeData: TreeNode[];
	modelValue: string | null;
}
defineProps<Props>();

defineEmits<{
	(event: "update:modelValue", value: string | null): void;
	(event: "toggle-expand-item", item: TreeNode): void;
}>();
</script>

<template>
	<aside class="explorer-container">
		<div class="explorer-header">Explorer</div>
		<ul class="file-tree-list">
			<FileExplorerItem
				v-for="item in treeData"
				:key="item.path"
				:item="item"
				:selectedFile="modelValue"
				@file-selected="$emit('update:modelValue', $event)"
				@toggle-expand-item="$emit('toggle-expand-item', $event)"
			/>
		</ul>
	</aside>
</template>

<style scoped>
.explorer-container {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #252526;
	color: #cccccc;
	overflow-y: auto;
	user-select: none;
	border-right: 1px solid #2d2d30;
	font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
	min-width: 200px;
}

.explorer-header {
	padding: 10px 16px 10px 20px;
	font-size: 12px;
	font-weight: 700;
	color: #cccccc;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	background-color: #2d2d30;
	border-bottom: 1px solid #3c3c3c;
	position: sticky;
	top: 0;
	z-index: 10;
	display: flex;
	align-items: center;
	height: 40px;
	box-sizing: border-box;
}

.explorer-header::before {
	content: "";
	width: 16px;
	height: 16px;
	margin-right: 6px;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23cccccc' d='M14.5 3H7.71l-.85-.85L6.51 2h-5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-.5-.5z'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-size: contain;
	flex-shrink: 0;
}

.file-tree-list {
	flex: 1;
	list-style: none;
	padding: 0;
	margin: 0;
	overflow-y: auto;
}

.file-tree-list::-webkit-scrollbar {
	width: 10px;
}

.file-tree-list::-webkit-scrollbar-track {
	background: #2d2d30;
}

.file-tree-list::-webkit-scrollbar-thumb {
	background: #424242;
	border-radius: 5px;
}

.file-tree-list::-webkit-scrollbar-thumb:hover {
	background: #4f4f4f;
}

.select-none {
	user-select: none;
}
</style>
