<script setup lang="ts">
import { Icon } from "@iconify/vue";
import {
	useFileTabManager,
	type FileTabManagerProps,
	type FileTabManagerEmits,
} from "../../composables/code-review/useFileTabManager";


const { t } = useI18n();

const props = defineProps<FileTabManagerProps>();
const emit = defineEmits<FileTabManagerEmits>();

const {
	// Computed
	currentTabs,
	isDragging,
	draggedFilePath,

	// Functions
	handleHorizontalTabScroll,
	handleDragEnd,
	handleDragOver,
	handleDragStart,
	handleDrop,
	setActiveFileTab,
	removeFileTab,
} = useFileTabManager(props, emit);
</script>

<template>
	<div v-if="currentTabs.length > 0" class="flex flex-col h-full">
		<!-- File Tabs -->
		<div class="w-full bg-white/5 backdrop-blur-sm border-b border-white/10 py-2">
			<!-- File tabs container -->
			<div class="flex items-center py-1">
				<!-- Mutliple File Tabs -->
				<div
					v-if="currentTabs.length > 1"
					ref="fileTabsContainer"
					class="file-tabs scrollbar-hidden"
					@wheel="handleHorizontalTabScroll"
				>
					<div
						v-for="(file, index) in currentTabs"
						:key="file"
						class="file-tab"
						:class="{
							'active': file === activeTab,
							'opacity-50 scale-95': isDragging && file === draggedFilePath,
							'ml-4': index === 0,
							'mr-4': index === currentTabs.length - 1,
						}"
						@dragover="handleDragOver"
						@drop="handleDrop($event, index)"
					>
						<button
							:draggable="props.panelId ? true : false"
							@dragstart="handleDragStart($event, file)"
							@dragend="handleDragEnd"
							@click="setActiveFileTab(file)"
							:title="file"
							class="flex items-center gap-2 px-3 py-1 duration-200 cursor-pointer"
							:class="{
								'text-white': file === activeTab,
								'text-slate-300 hover:text-white': file !== activeTab,
								'opacity-50': isDragging && file === draggedFilePath,
								'select-none cursor-grab active:cursor-grabbing': props.panelId,
							}"
						>
							<span class="truncate max-w-32">{{ getFileName(file) }}</span>
						</button>

						<!-- Close tab button -->
						<button
							@click="removeFileTab(file)"
							class="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-white hover:bg-white/10 rounded-md duration-200 mr-1 cursor-pointer text-sm"
							:title="t('panel.closeFile')"
						>
							<Icon icon="mdi:close" class="w-6 h-6" />
						</button>
					</div>
				</div>

				<!-- Single Open File Label -->
				<div v-else class="flex items-center gap-2 px-2 py-1 text-slate-300">
					<!-- TODO: take a look at the null checkers -->
					<span
						class="text-slate-300 font-semibold ml-4"
						>{{ getFileName(currentTabs[0] ?? '') }}</span
					>

					<!-- Close tab button -->
					<button
						@click="removeFileTab(currentTabs[0] ?? '')"
						class="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-white hover:bg-white/10 rounded-md duration-200 cursor-pointer"
						:title="t('panel.closeFile')"
					>
						<Icon icon="mdi:close" class="w-6 h-6" />
					</button>
				</div>
			</div>
		</div>

		<!-- Slot for file content -->
		<div class="flex-1 overflow-hidden">
			<slot></slot>
		</div>
	</div>
</template>
