<script setup lang="ts">
import { inject } from "vue";
import { getFileIcon, getFileIconColor } from "../utils/fileUtils";
import { type TreeNode } from "../types/githubTree.ts";
import Icon from "../lib/Icon.vue";
import { useRepositoryStore } from "../stores/repositoryStore.ts";

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

// File/Folder comment data
const updateFileCommentData: (filePath: string, content: string) => void = inject("updateFileCommentData", () =>
	console.warn("updateFileCommentData not provided")
);
const updateIsAddingFileComment: (value: boolean) => void = inject("updateIsAddingFileComment", () =>
	console.warn("updateIsAddingFileComment not provided")
);

function addFileComment() {
	updateIsAddingFileComment(true);
	updateFileCommentData(props.item.path, "");
}

// Check if the file contains comments
const repositoryStore = useRepositoryStore();
function containsComments(filePath: string): boolean {
	return repositoryStore.fileContainsComments(filePath);
}
</script>

<template>
	<li class="list-none transition-colors duration-100" :title="item.path">
		<!-- Item container with hover and click handling -->
		<div
			class="flex items-center hover:bg-gray-500"
			:class="{
				'contains-comments': containsComments(item.path),
				selected: item.path === modelValue && item.type === 'file',
			}"
		>
			<div
				@click="itemClicked"
				class="flex flex-grow items-center gap-2 cursor-pointer text-gray-300 min-w-0"
				:title="item.path"
				:style="{
					paddingLeft: `${props.depth * 16 + 8}px`,
				}"
			>
				<!-- Arrow expand icon for folders -->
				<span
					v-if="item.type === 'folder'"
					class="w-[18px] h-[18px] flex items-center justify-center mr-0.5 text-gray-300 transition-transform duration-100 flex-shrink-0 hover:text-white"
					@click.stop="toggleExpand"
				>
					<Icon
						srcName="arrow"
						size="18px"
						class="transition-transform duration-100 origin-center"
						:class="{ 'rotate-90': item.isExpanded }"
					/>
				</span>
				<span v-else class="w-5 flex-shrink-0"></span>

				<!-- Item Icon -->
				<span class="w-[18px] h-[18px] mr-2 flex items-center justify-center flex-shrink-0">
					<!-- Folder icon for folders -->
					<Icon
						v-if="item.type === 'folder'"
						:srcName="item.isExpanded ? 'openFolder' : 'closedFolder'"
						size="18px"
						class="transition-all duration-100"
					/>
					<!-- File icon for files -->
					<Icon
						v-else
						:text-icon="getFileIcon(item.name)"
						class="transition-all duration-100"
						:style="{
							color:
								item.path === props.modelValue && item.type === 'file'
									? 'inherit'
									: getFileIconColor(item.name),
						}"
					/>
				</span>

				<!-- File or folder name -->
				<span
					class="flex-1 text-md truncate"
					:class="{ '!text-white': item.path === props.modelValue && item.type === 'file' }"
				>
					{{ item.name }}
				</span>

				<!-- Contains comments indicator -->
				<span v-if="containsComments(item.path)" class="ml-2 text-sm">💬</span>
			</div>

			<!-- Item Actions -->
			<div class="ml-2">
				<button class="btn text-xl" @click="addFileComment">+</button>
			</div>
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
