<script setup lang="ts">
import FileExplorerItem from "./FileExplorerItem.vue";
import type { TreeNode } from "../types/githubTree.ts";

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
	<aside class="h-full flex flex-col">
		<div
			class="py-2.5 text-xs font-bold text-white uppercase tracking-widest bg-black flex items-center h-10 before:w-4"
		>
			Explorer
		</div>
		<ul class="flex-1 overflow-y-auto scrollbar-hidden">
			<FileExplorerItem
				v-for="item in treeData"
				:key="item.path"
				:item="item"
				:modelValue="modelValue"
				@update:modelValue="$emit('update:modelValue', $event)"
				@toggle-expand-item="$emit('toggle-expand-item', $event)"
			/>
		</ul>
	</aside>
</template>
