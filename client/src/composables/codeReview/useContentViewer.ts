import { ref, computed, onUnmounted } from "vue";
import type { FileDisplayType } from "../../types/github/githubFile";

export interface ContentViewerProps {
	selectedFilePath: string | null;
	fileName: string;
	downloadUrl: string;
	displayType: FileDisplayType;
	previewUrl: string;
}

export function useContentViewer() {
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

	// Computed zoom percentage for display
	const zoomPercentage = computed(() => Math.round(zoom.value * 100));

	// Methods
	const resetZoom = (): void => {
		zoom.value = 1;
		panX.value = 0;
		panY.value = 0;
	};

	// Mouse wheel zoom
	const handleWheel = (event: WheelEvent): void => {
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
	const startDrag = (event: MouseEvent): void => {
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

	const handleDrag = (event: MouseEvent): void => {
		if (!isDragging.value) return;

		panX.value = event.clientX - dragStart.value.x;
		panY.value = event.clientY - dragStart.value.y;
	};

	const stopDrag = (): void => {
		isDragging.value = false;
		document.removeEventListener("mousemove", handleDrag);
		document.removeEventListener("mouseup", stopDrag);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	};

	// Touch support for mobile
	const handleTouchStart = (event: TouchEvent): void => {
		if (event.touches.length === 1) {
			const touch = event.touches[0];
			startDrag({
				clientX: touch.clientX,
				clientY: touch.clientY,
				preventDefault: () => event.preventDefault(),
			} as MouseEvent);
		}
	};

	const handleTouchMove = (event: TouchEvent): void => {
		if (event.touches.length === 1 && isDragging.value) {
			event.preventDefault();
			const touch = event.touches[0];
			handleDrag({
				clientX: touch.clientX,
				clientY: touch.clientY,
			} as MouseEvent);
		}
	};

	const handleTouchEnd = (): void => {
		stopDrag();
	};

	// Cleanup on unmount
	onUnmounted(() => {
		// Clean up any remaining event listeners
		document.removeEventListener("mousemove", handleDrag);
		document.removeEventListener("mouseup", stopDrag);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	});

	return {
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
	};
}
