<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
	modelValue: string | null; // This is the file path of the currently active tab
}>();

const emits = defineEmits<{
	(event: "update:modelValue", value: string | null): void;
}>();

const openFileTabs = ref<string[]>([]);

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
	<div v-if="openFileTabs.length > 0" class="flex flex-1 flex-col h-full">
		<!-- File Tabs -->
		<div class="flex flex-row">
			<ul class="file-tabs">
				<li
					v-for="file in openFileTabs"
					:key="file"
					class="file-tab"
					:class="{
						active: file === modelValue,
					}"
				>
					<span @click="setActiveFileTab(file)">{{ file }}</span>
					<span class="flex items-center justify-center cursor-pointer" @click="removeFileTab(file)">X</span>
				</li>
			</ul>
		</div>
		<!-- Slot -->
		<div class="flex-1 overflow-hidden">
			<slot></slot>
		</div>
	</div>
</template>
