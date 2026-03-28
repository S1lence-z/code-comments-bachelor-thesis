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
	handleDragEnd,
	handleDragOver,
	handleDragStart,
	handleDrop,
	setActiveFileTab,
	removeFileTab,
	pinFileTab,
	isPreviewTab,
} = useFileTabManager(props, emit);
</script>

<template>
	<div v-if="currentTabs.length > 0" class="flex flex-col h-full">
		<!-- File Tabs -->
		<div class="w-full bg-white/5 backdrop-blur-sm border-b border-white/10">
			<!-- File tabs container -->
			<div
				ref="fileTabsContainer"
				class="flex items-center py-2 overflow-scroll scrollbar-minimal overflow-y-hidden"
			>
				<!-- File Tabs -->
				<div class="flex items-center gap-2 px-4">
					<div
						v-for="(file, index) in currentTabs"
						:key="file"
						class="file-tab"
						:class="{
							'active': file === activeTab && !isPreviewTab(file),
							'active-preview': file === activeTab && isPreviewTab(file),
							'opacity-50 scale-95': isDragging && file === draggedFilePath,
							'opacity-75': isPreviewTab(file) && file !== activeTab,
						}"
						@dragover="handleDragOver"
						@drop="handleDrop($event, index)"
					>
						<button
							:draggable="props.panelId ? true : false"
							@dragstart="handleDragStart($event, file)"
							@dragend="handleDragEnd"
							@click="setActiveFileTab(file)"
							@dblclick="pinFileTab(file)"
							:title="file"
							class="flex items-center gap-2 px-3 py-1 duration-200 cursor-pointer"
							:class="{
								'text-white': file === activeTab,
								'text-slate-300 hover:text-white': file !== activeTab,
								'opacity-50': isDragging && file === draggedFilePath,
								'select-none cursor-grab active:cursor-grabbing': props.panelId,
							}"
						>
							<span
								class="truncate max-w-32"
								:class="{ 'italic': isPreviewTab(file) }"
								>{{ getFileName(file) }}</span
							>
						</button>
						<!-- Close/Preview indicator button -->
						<button
							@click="removeFileTab(file)"
							class="group flex items-center justify-center w-6 h-6 text-slate-400 hover:text-white hover:bg-white/10 rounded-md duration-200 mr-1 cursor-pointer text-sm"
							:title="t('panel.closeFile')"
						>
							<template v-if="isPreviewTab(file)">
								<span
									class="w-2 h-2 rounded-full bg-slate-400 group-hover:hidden"
								></span>
								<Icon icon="mdi:close" class="w-6 h-6 hidden group-hover:block" />
							</template>
							<Icon v-else icon="mdi:close" class="w-6 h-6" />
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
