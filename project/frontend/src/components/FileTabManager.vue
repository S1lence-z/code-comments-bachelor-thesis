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
	<div v-if="openFileTabs.length > 0" class="flex flex-col h-full overflow-hidden">
		<!-- File Tabs -->
		<div class="w-full bg-white/5 backdrop-blur-sm border-b border-white/10 py-2">
			<div class="flex items-center px-4">
				<!-- Open Files Label -->
				<span class="text-slate-300 font-semibold mr-6">Open Files</span>
				<!-- File Tabs -->
				<div class="file-tabs scrollbar-hidden">
					<div
						v-for="file in openFileTabs"
						:key="file"
						class="file-tab"
						:class="{ active: file === modelValue }"
					>
						<button
							@click="setActiveFileTab(file)"
							:title="file"
							class="flex items-center gap-2 px-3 py-2 duration-200 cursor-pointer"
							:class="{
								'text-white': file === modelValue,
								'text-slate-300 hover:text-white': file !== modelValue,
							}"
						>
							<span class="truncate max-w-32">{{ getFileName(file) }}</span>
						</button>

						<button
							@click="removeFileTab(file)"
							class="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-white hover:bg-white/10 rounded-md duration-200 mr-1 cursor-pointer"
							title="Close file"
						>
							x
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Slot for file content -->
		<div class="flex-1 overflow-hidden">
			<slot></slot>
		</div>
	</div>
</template>
