<script setup lang="ts">
import { ref, computed } from "vue";
import type { FileDisplayType } from "../types/githubFile";

interface Props {
	displayType: FileDisplayType;
	downloadUrl: string | null;
	fileName: string;
	selectedFilePath: string | null;
}

defineProps<Props>();

// Zoom and pan state
const zoom = ref<number>(1);
const panX = ref<number>(0);
const panY = ref<number>(0);
const isDragging = ref<boolean>(false);
const dragStart = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const containerRef = ref<HTMLElement | null>(null);

// Zoom constraints
const minZoom = 0.1;
const maxZoom = 5;
const zoomStep = 0.1;

// Computed styles for transform
const contentStyle = computed(() => ({
	transform: `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`,
}));

const resetZoom = () => {
	zoom.value = 1;
	panX.value = 0;
	panY.value = 0;
};

// Mouse wheel zoom
const handleWheel = (event: WheelEvent) => {
	event.preventDefault();

	const delta = event.deltaY > 0 ? -zoomStep : zoomStep;
	const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom.value + delta));

	if (newZoom !== zoom.value) {
		// Calculate zoom center based on mouse position
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const centerX = event.clientX - rect.left - rect.width / 2;
		const centerY = event.clientY - rect.top - rect.height / 2;

		// Adjust pan to zoom around mouse cursor
		const zoomRatio = newZoom / zoom.value;
		panX.value = panX.value * zoomRatio + centerX * (1 - zoomRatio);
		panY.value = panY.value * zoomRatio + centerY * (1 - zoomRatio);

		zoom.value = newZoom;
	}
};

// Drag functionality
const startDrag = (event: MouseEvent) => {
	isDragging.value = true;
	dragStart.value = {
		x: event.clientX - panX.value,
		y: event.clientY - panY.value,
	};

	document.addEventListener("mousemove", handleDrag);
	document.addEventListener("mouseup", stopDrag);
	document.body.style.cursor = "grabbing";
	document.body.style.userSelect = "none";
};

const handleDrag = (event: MouseEvent) => {
	if (!isDragging.value) return;

	panX.value = event.clientX - dragStart.value.x;
	panY.value = event.clientY - dragStart.value.y;
};

const stopDrag = () => {
	isDragging.value = false;
	document.removeEventListener("mousemove", handleDrag);
	document.removeEventListener("mouseup", stopDrag);
	document.body.style.cursor = "";
	document.body.style.userSelect = "";
};

// Touch support for mobile
const handleTouchStart = (event: TouchEvent) => {
	if (event.touches.length === 1) {
		const touch = event.touches[0];
		startDrag({
			clientX: touch.clientX,
			clientY: touch.clientY,
			preventDefault: () => event.preventDefault(),
		} as MouseEvent);
	}
};

const handleTouchMove = (event: TouchEvent) => {
	if (event.touches.length === 1 && isDragging.value) {
		event.preventDefault();
		const touch = event.touches[0];
		handleDrag({
			clientX: touch.clientX,
			clientY: touch.clientY,
		} as MouseEvent);
	}
};

const handleTouchEnd = () => {
	stopDrag();
};
</script>

<template>
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
			{{ Math.round(zoom * 100) }}%
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
			<template v-if="displayType === 'image'">
				<img
					:src="downloadUrl ?? undefined"
					:alt="`Image: ${selectedFilePath}`"
					:style="contentStyle"
					class="max-w-none max-h-none pointer-events-none select-none"
					draggable="false"
				/>
			</template>

			<!-- PDF Content -->
			<template v-else-if="displayType === 'pdf'">
				<div :style="contentStyle" class="w-full h-full max-w-none max-h-none">
					<iframe
						:src="downloadUrl ?? undefined"
						class="w-full h-full border-0 pointer-events-auto"
						frameborder="0"
						allowfullscreen
						@mousedown.stop
					></iframe>
				</div>
			</template>

			<!-- Binary File Content -->
			<template v-else-if="displayType === 'binary'">
				<div class="p-8 text-center">
					<div class="text-6xl text-gray-600 mb-4">📄</div>
					<div class="text-gray-400 text-lg mb-2">Binary File</div>
					<div class="text-gray-500 text-sm">{{ fileName }}</div>
					<div class="text-gray-600 text-xs mt-2">Content cannot be displayed</div>
				</div>
			</template>

			<!-- Unsupported File Type -->
			<template v-else>
				<div class="p-8 text-center">
					<div class="text-6xl text-gray-600 mb-4">❓</div>
					<div class="text-gray-400 text-lg mb-2">Unsupported File Type</div>
					<div class="text-gray-500 text-sm">{{ fileName }}</div>
				</div>
			</template>
		</div>
	</div>
</template>
