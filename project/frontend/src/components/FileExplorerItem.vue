<script setup lang="ts">
import { ref, watch } from "vue";
import { getFileIcon, getFileIconColor } from "../utils/fileUtils";
import { type TreeNode } from "../types/githubApi.ts";

interface FileExplorerItemProps {
	item: TreeNode;
	modelValue: string | null;
	depth?: number;
}

const props = withDefaults(defineProps<FileExplorerItemProps>(), {
	depth: 0,
});

const emits = defineEmits<{
	(event: "update:modelValue", value: string | null): void;
	(event: "toggle-expand-item", item: TreeNode): void;
}>();
const isHovered = ref(false);

function itemClicked() {
	if (props.item.type === "file") {
		emits("update:modelValue", props.item.path);
	} else if (props.item.type === "folder") {
		// Clicking folder name also toggles
		emits("toggle-expand-item", props.item);
	}
}

function toggleExpand() {
	if (props.item.type === "folder") {
		emits("toggle-expand-item", props.item);
	}
}

function getBackgroundColor() {
	if (props.item.path === props.modelValue && props.item.type === "file") {
		return "#094771"; // VS Code selection color
	}
	if (isHovered.value) {
		return "#2a2d2e"; // VS Code hover color
	}
	return "transparent";
}

watch;
</script>

<template>
	<li class="list-none m-0 p-0">
		<!-- Item container with hover and click handling -->
		<div
			@click="itemClicked"
			class="flex items-center h-7 cursor-pointer text-sm text-gray-300 transition-colors duration-100 whitespace-nowrap"
			:title="item.path"
			@mouseover="isHovered = true"
			@mouseleave="isHovered = false"
			:style="{
				paddingLeft: `${depth * 20 + 2}px`,
				backgroundColor: getBackgroundColor(),
			}"
		>
			<!-- Arrow expand icon for folders -->
			<span
				v-if="item.type === 'folder'"
				class="w-[18px] h-[18px] flex items-center justify-center mr-0.5 text-gray-300 transition-transform duration-100 flex-shrink-0 hover:text-white"
				@click.stop="toggleExpand"
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 16 16"
					class="transition-transform duration-100 origin-center"
					:class="{ 'rotate-90': item.isExpanded }"
				>
					<path fill="currentColor" d="M6 4l4 4-4 4V4z" />
				</svg>
			</span>

			<span v-else class="w-5 flex-shrink-0"></span>

			<!-- Item Icon -->
			<span class="w-[18px] h-[18px] mr-2 flex items-center justify-center flex-shrink-0">
				<!-- Folder icon for folders -->
				<svg
					v-if="item.type === 'folder'"
					width="18"
					height="18"
					viewBox="0 0 16 16"
					class="transition-all duration-100"
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
				<!-- File icon for files -->
				<span
					v-else
					class="font-semibold text-xs leading-none flex items-center justify-center w-[18px] h-[18px] rounded-sm transition-all duration-100"
					:style="{
						color:
							item.path === props.modelValue && item.type === 'file'
								? 'inherit'
								: getFileIconColor(item.name),
					}"
				>
					{{ getFileIcon(item.name) }}
				</span>
			</span>

			<!-- File or folder name -->
			<span
				class="flex-1 text-ellipsis whitespace-nowrap text-sm"
				:class="{ '!text-white': item.path === props.modelValue && item.type === 'file' }"
			>
				{{ item.name }}
			</span>
		</div>

		<!-- Render children if item is a folder and expanded -->
		<ul v-if="item.type === 'folder' && item.isExpanded && item.children && item.children.length > 0">
			<FileExplorerItem
				v-for="child in item.children"
				:key="child.path"
				:item="child"
				:modelValue="props.modelValue"
				@update:modelValue="$emit('update:modelValue', $event)"
				:depth="depth + 1"
				@toggle-expand-item="$emit('toggle-expand-item', $event)"
			/>
		</ul>
	</li>
</template>
