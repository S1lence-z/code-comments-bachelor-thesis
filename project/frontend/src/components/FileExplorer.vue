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
	<aside
		class="h-full flex flex-col bg-[#252526] text-[#cccccc] overflow-y-auto select-none border-r border-[#2d2d30] font-sans min-w-[200px]"
	>
		<div
			class="px-4 py-2.5 pl-5 text-xs font-bold text-[#cccccc] uppercase tracking-widest bg-[#2d2d30] border-b border-[#3c3c3c] sticky top-0 z-10 flex items-center h-10 box-border before:content-[''] before:w-4 before:h-4 before:mr-1.5 before:bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'%23cccccc\' d=\'M14.5 3H7.71l-.85-.85L6.51 2h-5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-.5-.5z\'/%3E%3C/svg%3E')] before:bg-no-repeat before:bg-contain before:flex-shrink-0"
		>
			Explorer
		</div>
		<ul
			class="flex-1 list-none p-0 m-0 overflow-y-auto [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-[#2d2d30] [&::-webkit-scrollbar-thumb]:bg-[#424242] [&::-webkit-scrollbar-thumb]:rounded-[5px] [&::-webkit-scrollbar-thumb:hover]:bg-[#4f4f4f]"
		>
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
