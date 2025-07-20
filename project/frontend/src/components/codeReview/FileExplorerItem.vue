<script setup lang="ts">
import { inject } from "vue";
import { getFileIcon, getFileIconColor } from "../../utils/fileUtils";
import { type TreeNode } from "../../types/githubTree.ts";
import Icon from "../../lib/Icon.vue";
import { useRepositoryStore } from "../../stores/repositoryStore.ts";
import { handleToggleExpandInTree } from "../../utils/treeNodeUtils.ts";
import { fileCommentModalContextKey } from "../../core/keys.ts";

interface FileExplorerItemProps {
	item: TreeNode;
	filePath: string | null;
	depth?: number;
}

const props = withDefaults(defineProps<FileExplorerItemProps>(), {
	depth: 0,
});

const emits = defineEmits<{
	(event: "update:filePath", value: string | null): void;
	(event: "toggle-expand-item", item: TreeNode): void;
}>();

function itemClicked() {
	if (props.item.type === "file") {
		emits("update:filePath", props.item.path);
	} else if (props.item.type === "folder") {
		emits("toggle-expand-item", props.item);
	}
}

function toggleExpand() {
	if (props.item.type === "folder") {
		emits("toggle-expand-item", props.item);
	}
}

// File/Folder comment data
const { updateFileCommentData, updateIsAddingFileComment } = inject(fileCommentModalContextKey, {
	updateFileCommentData: (_: string, __: string) => console.warn("updateFileCommentData not provided"),
	updateIsAddingFileComment: (_: boolean) => console.warn("updateIsAddingFileComment not provided"),
});

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
	<li class="list-none" :title="item.path">
		<!-- Item Container -->
		<div
			class="flex items-center rounded-lg transition-all duration-200"
			:class="{
				'bg-white/10 text-white border border-white/20': item.path === filePath && item.type === 'file',
				'bg-amber-500/10 border border-amber-500/20': containsComments(item.path) && item.path !== filePath,
				'hover:bg-white/5': item.path !== filePath,
			}"
		>
			<div
				@click="itemClicked"
				class="flex flex-grow items-center gap-2 cursor-pointer text-slate-300 min-w-0 py-2 px-3 rounded-lg"
				:title="item.path"
				:style="{
					paddingLeft: `${props.depth * 16 + 12}px`,
				}"
			>
				<!-- Arrow expand icon for folders -->
				<span
					v-if="item.type === 'folder'"
					class="w-4 h-4 flex items-center justify-center text-slate-400 transition-all duration-200 flex-shrink-0 hover:text-white"
					@click.stop="toggleExpand"
				>
					<Icon
						srcName="arrow"
						size="16px"
						class="transition-transform duration-200 origin-center"
						:class="{ 'rotate-90': item.isExpanded }"
					/>
				</span>
				<span v-else class="w-4 flex-shrink-0"></span>

				<!-- Item Icon -->
				<span class="w-5 h-5 flex items-center justify-center flex-shrink-0">
					<!-- Folder icon for folders -->
					<Icon
						v-if="item.type === 'folder'"
						:srcName="item.isExpanded ? 'openFolder' : 'closedFolder'"
						size="18px"
						class="transition-all duration-200"
						:class="{
							'text-blue-400': item.isExpanded,
							'text-slate-400': !item.isExpanded,
						}"
					/>
					<!-- File icon for files -->
					<Icon
						v-else
						:text-icon="getFileIcon(item.name)"
						size="18px"
						class="transition-all duration-200"
						:style="{
							color:
								item.path === props.filePath && item.type === 'file'
									? 'currentColor'
									: getFileIconColor(item.name),
						}"
					/>
				</span>

				<!-- File or folder name -->
				<span
					class="flex-1 text-sm font-medium truncate transition-colors duration-200"
					:class="{
						'text-white': item.path === props.filePath && item.type === 'file',
						'text-slate-300 group-hover:text-white': item.path !== props.filePath,
					}"
				>
					{{ item.name }}
				</span>

				<!-- Contains comments indicator -->
				<span v-if="containsComments(item.path)" class="flex items-center gap-1 ml-2">
					<div class="w-2 h-2 bg-amber-400 rounded-full"></div>
					<span class="text-xs text-amber-400">💬</span>
				</span>
			</div>

			<!-- Item Actions -->
			<div class="mr-2 duration-200">
				<button
					@click="addFileComment"
					class="w-6 h-6 bg-white/10 hover:bg-white/20 hover:text-white rounded-md flex items-center justify-center transition-all duration-200 text-black cursor-pointer"
					title="Add comment"
				>
					+
				</button>
			</div>
		</div>

		<!-- Render children if item is a folder and expanded -->
		<ul
			v-if="item.type === 'folder' && item.isExpanded && item.children && item.children.length > 0"
			class="mt-1 space-y-1"
		>
			<FileExplorerItem
				v-for="child in item.children"
				:key="child.path"
				:item="child"
				:depth="props.depth + 1"
				:filePath="props.filePath"
				@update:filePath="$emit('update:filePath', $event)"
				@toggle-expand-item="handleToggleExpandInTree(child, item.children)"
			/>
		</ul>
	</li>
</template>
