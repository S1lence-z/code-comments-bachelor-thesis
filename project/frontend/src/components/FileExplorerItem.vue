<script setup lang="ts">
import { ref, withDefaults } from "vue";
import { getFileIcon, getFileIconColor } from "../utils/fileUtils";
import { type TreeNode } from "../types/githubApi.ts";

interface FileExplorerItemProps {
	item: TreeNode;
	selectedFile: string | null;
	depth?: number;
}

const props = withDefaults(defineProps<FileExplorerItemProps>(), {
	depth: 0,
});

const emit = defineEmits(["file-selected", "toggle-expand-item"]);
const isHovered = ref(false);

function itemClicked() {
	if (props.item.type === "file") {
		emit("file-selected", props.item.path);
	} else if (props.item.type === "folder") {
		// Clicking folder name also toggles
		emit("toggle-expand-item", props.item);
	}
}

function toggleExpand() {
	if (props.item.type === "folder") {
		emit("toggle-expand-item", props.item);
	}
}

function getBackgroundColor() {
	if (props.item.path === props.selectedFile && props.item.type === "file") {
		return "#094771"; // VS Code selection color
	}
	if (isHovered.value) {
		return "#2a2d2e"; // VS Code hover color
	}
	return "transparent";
}
</script>

<template>
	<li class="explorer-item">
		<div
			@click="itemClicked"
			:class="{
				'selected-file': item.path === selectedFile && item.type === 'file',
				'explorer-item-content': true,
				'is-folder': item.type === 'folder',
			}"
			:title="item.path"
			@mouseover="isHovered = true"
			@mouseleave="isHovered = false"
			:style="{
				paddingLeft: `${depth * 20 + 2}px`,
				backgroundColor: getBackgroundColor(),
			}"
		>
			<span v-if="item.type === 'folder'" class="folder-toggle" @click.stop="toggleExpand">
				<svg
					width="18"
					height="18"
					viewBox="0 0 16 16"
					class="chevron-icon"
					:class="{ expanded: item.isExpanded }"
				>
					<path fill="currentColor" d="M6 4l4 4-4 4V4z" />
				</svg>
			</span>
			<span v-else class="icon-spacer"></span>
			<span class="item-icon">
				<svg
					v-if="item.type === 'folder'"
					width="18"
					height="18"
					viewBox="0 0 16 16"
					class="folder-icon"
					:class="{ expanded: item.isExpanded }"
				>
					<path
						v-if="!item.isExpanded"
						fill="#dcb67a"
						d="M14.5 3H7.71l-.85-.85L6.51 2h-5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0-.5-.5v-10a.5.5 0 0 0-.5-.5z"
					/>
					<path
						v-else
						fill="#dcb67a"
						d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3.797a1.5 1.5 0 0 1 1.06.44L8.914 3H14.5A1.5 1.5 0 0 1 16 4.5v7A1.5 1.5 0 0 1 14.5 13h-13A1.5 1.5 0 0 1 0 11.5v-9z"
					/>
				</svg>
				<span v-else class="file-icon" :style="{ color: getFileIconColor(item.name) }">{{
					getFileIcon(item.name)
				}}</span>
			</span>

			<span class="item-name">{{ item.name }}</span>
		</div>

		<ul
			v-if="item.type === 'folder' && item.isExpanded && item.children && item.children.length > 0"
			class="children-list"
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

<style scoped>
.explorer-item {
	list-style: none;
	margin: 0;
	padding: 0;
}

.explorer-item-content {
	display: flex;
	align-items: center;
	height: 28px;
	cursor: pointer;
	font-size: 14px;
	color: #cccccc;
	transition: background-color 0.1s ease;
	white-space: nowrap;
	overflow: hidden;
	position: relative;
	box-sizing: border-box;
}

.explorer-item-content:hover {
	background-color: #2a2d2e !important;
}

.selected-file {
	background-color: #094771 !important;
	color: #ffffff;
}

.selected-file .item-name {
	color: #ffffff;
}

.folder-toggle {
	width: 18px;
	height: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 2px;
	color: #cccccc;
	transition: transform 0.1s ease;
	flex-shrink: 0;
}

.folder-toggle:hover {
	color: #ffffff;
}

.chevron-icon {
	transition: transform 0.1s ease;
	transform-origin: center;
}

.chevron-icon.expanded {
	transform: rotate(90deg);
}

.icon-spacer {
	width: 20px;
	flex-shrink: 0;
}

.item-icon {
	width: 18px;
	height: 18px;
	margin-right: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.folder-icon {
	transition: all 0.1s ease;
}

.item-name {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 14px;
	line-height: 28px;
	color: inherit;
}

.children-list {
	list-style: none;
	margin: 0;
	padding: 0;
}

/* File type specific colors for icons */
.file-icon {
	font-weight: 600;
	font-size: 12px;
	line-height: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	background-color: rgba(255, 255, 255, 0.1);
	border-radius: 2px;
	transition: all 0.1s ease;
}

/* Override colors for specific file types if needed */
.explorer-item-content:not(.is-folder) .item-name {
	color: #cccccc;
}

.selected-file .file-icon {
	background-color: rgba(255, 255, 255, 0.2);
	color: inherit !important;
}
</style>
