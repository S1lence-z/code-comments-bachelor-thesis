<script setup lang="ts">
import { getFileIcon, getFileIconColor } from "../../utils/fileUtils";
import { handleToggleExpandInTree } from "../../utils/treeNodeUtils.ts";
import {
	useFileExplorerItem,
	type FileExplorerItemProps,
	type FileExplorerItemEmits,
} from "../../composables/components/useFileExplorerItem";
import { TreeNodeType } from "../../types/github/githubTree";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = withDefaults(defineProps<FileExplorerItemProps>(), {
	depth: 0,
});
const emit = defineEmits<FileExplorerItemEmits>();

// Initialize the composable
const { handleItemClick, handleToggleExpand, fileContainsComments, hasCommentedChildren, isFileSelected } =
	useFileExplorerItem(props, emit);
</script>

<template>
	<li class="list-none" :title="currentNode.path">
		<!-- Item Container -->
		<div
			class="flex items-center rounded-lg transition-all duration-200"
			:class="{
				'bg-white/10 text-white border border-white/20': isFileSelected,
				'bg-amber-500/10 border border-amber-500/20': hasCommentedChildren,
				'hover:bg-white/5': !isFileSelected,
			}"
		>
			<!-- Item Info -->
			<div
				@click="handleItemClick(currentNode)"
				class="flex flex-grow items-center gap-2 cursor-pointer text-slate-300 min-w-0 py-2 px-3 rounded-lg"
				:title="currentNode.path"
				:style="{
					paddingLeft: `${props.depth * 16 + 12}px`,
				}"
			>
				<!-- Arrow expand icon for folders -->
				<span
					v-if="currentNode.type === TreeNodeType.folder"
					class="w-4 h-4 flex items-center justify-center text-slate-400 transition-all duration-200 flex-shrink-0 hover:text-white"
					@click.stop="handleToggleExpand(currentNode)"
				>
					<Icon
						icon="mdi:chevron-right"
						class="w-8 h-8 transition-transform duration-200 origin-center"
						:class="{ 'rotate-90': currentNode.isExpanded }"
					/>
				</span>
				<span v-else class="w-4 flex-shrink-0"></span>

				<!-- Item Icon -->
				<span class="w-6 h-6 flex items-center justify-center flex-shrink-0">
					<!-- Folder icon for folders -->
					<Icon
						v-if="currentNode.type === TreeNodeType.folder"
						:icon="currentNode.isExpanded ? 'mdi:folder-open' : 'mdi:folder'"
						class="w-6 h-6 transition-all duration-200 text-amber-300"
					/>
					<!-- File icon for files -->
					<span
						v-else
						class="w-6 h-6 flex items-center justify-center text-xs font-bold transition-all duration-200"
						:style="{
							color:
								isFileSelected && currentNode.type === TreeNodeType.file
									? 'currentColor'
									: getFileIconColor(currentNode.name),
						}"
					>
						{{ getFileIcon(currentNode.name) }}
					</span>
				</span>

				<!-- File or folder name -->
				<span
					class="flex-1 text-sm font-medium truncate transition-colors duration-200 text-slate-300"
					:class="{
						'text-white': isFileSelected && currentNode.type === TreeNodeType.file,
						'hover:text-white': !isFileSelected,
					}"
				>
					{{ currentNode.name }}
				</span>

				<!-- Contains comments indicator -->
				<span v-if="fileContainsComments(currentNode.path)" class="flex items-center gap-1 ml-2">
					<div class="w-2 h-2 bg-amber-400 rounded-full"></div>
					<span class="text-xs text-amber-400">💬</span>
				</span>
			</div>

			<!-- Item Actions -->
			<div class="mr-2 duration-200">
				<button
					@click="emit('file-comment-requested', props.currentNode.path)"
					class="w-6 h-6 bg-white/10 hover:bg-white/20 hover:text-white rounded-md flex items-center justify-center transition-all duration-200 text-black cursor-pointer"
					:title="t('fileExplorer.addComment')"
				>
					+
				</button>
			</div>
		</div>

		<!-- Render children if item is a folder and expanded -->
		<ul
			v-if="
				currentNode.type === TreeNodeType.folder &&
				currentNode.isExpanded &&
				currentNode.children &&
				currentNode.children.length > 0
			"
			class="mt-1 space-y-1"
		>
			<FileExplorerItem
				v-for="child in currentNode.children"
				:key="child.path"
				:currentNode="child"
				:depth="props.depth + 1"
				:filePath="props.filePath"
				@update:filePath="emit('update:filePath', $event)"
				@toggle-expand-item="handleToggleExpandInTree(child, currentNode.children)"
				@file-comment-requested="emit('file-comment-requested', $event)"
			/>
		</ul>
	</li>
</template>
