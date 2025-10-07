<script setup lang="ts">
import { useContentViewer, type ContentViewerProps } from "../../composables/components/useContentViewer";
import { FileDisplayType } from "../../types/github/githubFile";

defineProps<ContentViewerProps>();

// Initialize the composable
const {
	// State
	isDragging,
	containerRef,

	// Computed
	contentStyle,
	zoomPercentage,

	// Methods
	resetZoom,
	handleWheel,
	startDrag,
	handleTouchStart,
	handleTouchMove,
	handleTouchEnd,
} = useContentViewer();
</script>

<template>
	<!-- PDF Content -->
	<template v-if="displayType === FileDisplayType.PDF">
		<div :style="contentStyle" class="w-full h-full max-w-none max-h-none">
			<iframe
				:src="previewUrl || downloadUrl || undefined"
				class="w-full h-full border-0 pointer-events-auto"
				frameborder="0"
				allowfullscreen
			></iframe>
		</div>
	</template>

	<div
		ref="containerRef"
		class="relative w-full h-full bg-[#272c33] overflow-hidden"
		@wheel="handleWheel"
		tabindex="0"
		@touchstart="handleTouchStart"
		@touchmove="handleTouchMove"
		@touchend="handleTouchEnd"
	>
		<!-- Zoom Level Display -->
		<div class="absolute top-4 left-4 z-10 bg-[#0e639c] rounded px-3 py-1 text-white text-sm">
			{{ zoomPercentage }}%
		</div>

		<!-- Control Panel -->
		<div class="absolute top-4 right-4 z-10 flex flex-col rounded-lg">
			<button
				@click="resetZoom"
				class="px-2 py-1 bg-[#0e639c] text-white rounded hover:bg-[#1177bb] transition-colors text-xl"
				title="Reset Zoom (Ctrl/Cmd + 0)"
			>
				Reset Zoom
			</button>
		</div>

		<!-- Content Container -->
		<div
			class="w-full h-full flex items-center justify-center cursor-grab"
			:class="{ 'cursor-grabbing': isDragging }"
			@mousedown="startDrag"
		>
			<!-- Image Content -->
			<template v-if="displayType === FileDisplayType.Image">
				<img
					:src="previewUrl || downloadUrl || ''"
					:alt="`Image: ${selectedFilePath}`"
					:style="contentStyle"
					class="max-w-none max-h-none pointer-events-none select-none"
					draggable="false"
				/>
			</template>

			<!-- Binary File Content -->
			<template v-else-if="displayType === FileDisplayType.Binary">
				<div class="p-8 text-center">
					<div class="text-6xl text-gray-600 mb-4">📄</div>
					<div class="text-gray-400 text-lg mb-2">Binary File</div>
					<div class="text-gray-500 text-sm">{{ fileName }}</div>
					<div class="text-gray-600 text-xs mt-2">Content cannot be displayed</div>
					<div class="text-gray-500 text-lg mt-1">
						You can take a look at it
						<a
							:href="downloadUrl ?? ''"
							class="text-blue-500 hover:underline"
							target="_blank"
							rel="noopener"
							>here</a
						>.
					</div>
				</div>
			</template>

			<!-- Unsupported File Type -->
			<template v-else>
				<div class="p-8 text-center">
					<div class="text-6xl text-gray-600 mb-4">❓</div>
					<div class="text-gray-400 text-lg mb-2">Unsupported File Type</div>
					<div class="text-gray-500 text-sm">{{ fileName }}</div>
					<div v-if="downloadUrl" class="text-gray-500 text-lg mt-1">
						You can take a look at it
						<a :href="downloadUrl" class="text-blue-500 hover:underline" target="_blank" rel="noopener"
							>here</a
						>.
					</div>
					<div v-else class="text-gray-500 text-sm mt-1">No download link available</div>
				</div>
			</template>
		</div>
	</div>
</template>
