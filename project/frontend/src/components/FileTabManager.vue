<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
	modelValue: string | null;
}>();

const emits = defineEmits<{
	(event: "update:modelValue", value: string | null): void;
}>();

const openFileTabs = ref<string[]>([]);

// Function to extract filename from full path
const getFileName = (filePath: string): string => {
	return filePath.split("/").pop() || filePath;
};

const setActiveFileTab = (filePath: string) => {
	if (openFileTabs.value.includes(filePath)) {
		emits("update:modelValue", filePath);
	}
};

const removeFileTab = (filePath: string) => {
	const index = openFileTabs.value.indexOf(filePath);
	if (index !== -1) {
		openFileTabs.value.splice(index, 1);
		if (props.modelValue === filePath) {
			emits("update:modelValue", openFileTabs.value[0] || null);
		}
	}
};

watch(
	() => props.modelValue,
	(newFilePath: string | null) => {
		if (newFilePath && !openFileTabs.value.includes(newFilePath)) {
			openFileTabs.value.push(newFilePath);
		}
	}
);
</script>

<template>
	<div v-if="openFileTabs.length > 0" class="flex flex-1 flex-col h-full overflow-hidden">
		<!-- File Tabs -->
		<div class="flex-shrink-0 w-full overflow-x-auto overflow-y-hidden scrollbar-hidden">
			<ul class="file-tabs flex flex-row gap-2 bg-black mb-1 min-w-max">
				<li
					v-for="file in openFileTabs"
					:key="file"
					class="file-tab"
					:class="{
						active: file === modelValue,
					}"
				>
					<span class="flex flex-1 px-4 py-2" @click="setActiveFileTab(file)" :title="file">{{
						getFileName(file)
					}}</span>
					<span class="flex flex-1 px-4 py-2 text-md border-l-2" @click="removeFileTab(file)">X</span>
				</li>
			</ul>
		</div>
		<!-- Slot -->
		<div class="flex-1 overflow-hidden">
			<slot></slot>
		</div>
	</div>
</template>
