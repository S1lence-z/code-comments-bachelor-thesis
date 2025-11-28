<script setup lang="ts">
import { useContentViewer, type ContentViewerProps } from "../../composables/code-review/useContentViewer";
import { FileDisplayType } from "../../types/domain/file-content";

const { t } = useI18n();

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
		<!-- Control Panel -->
		<div class="absolute top-4 left-4 right-4 z-10 flex justify-between">
			<span class="btn btn-primary btn-medium">{{ zoomPercentage }}%</span>
			<Button
				:label="t('contentViewer.resetZoom')"
				buttonStyle="primary"
				buttonSize="medium"
				@click="resetZoom"
			/>
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
					<div class="text-gray-400 text-lg mb-2">
						{{ t("contentViewer.binaryFile") }}
					</div>
					<div class="text-gray-500 text-sm">{{ fileName }}</div>
					<div class="text-gray-600 text-xs mt-2">
						{{ t("contentViewer.binaryFileSubtext") }}
					</div>
					<div class="text-gray-500 text-lg mt-1">
						You can take a look at it
						<a
							:href="downloadUrl ?? ''"
							class="text-blue-500 hover:underline"
							target="_blank"
							rel="noopener"
							>{{ t("contentViewer.viewOnGithub") }}</a
						>.
					</div>
				</div>
			</template>

			<!-- Unsupported File Type -->
			<template v-else>
				<div class="p-8 text-center">
					<div class="text-6xl text-gray-600 mb-4">❓</div>
					<div class="text-gray-400 text-lg mb-2">
						{{ t("contentViewer.unsupportedFileType") }}
					</div>
					<div class="text-gray-500 text-sm">{{ fileName }}</div>
					<div v-if="downloadUrl" class="text-gray-500 text-lg mt-1">
						You can take a look at it
						<a
							:href="downloadUrl"
							class="text-blue-500 hover:underline"
							target="_blank"
							rel="noopener"
							>{{
							t("contentViewer.viewOnGithub")
							}}</a
						>.
					</div>
					<div v-else class="text-gray-500 text-sm mt-1">
						{{ t("contentViewer.noDownloadLink") }}
					</div>
				</div>
			</template>
		</div>
	</div>
</template>
