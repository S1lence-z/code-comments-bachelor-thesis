<script setup lang="ts">
import { ref, onUnmounted, onMounted } from "vue";

interface ResizeHandleProps {
	/** The element that should be resized */
	resizableElement: HTMLElement | null;
	/** Minimum width/size constraint */
	minWidth?: number;
	/** Maximum width/size constraint */
	maxWidth?: number;
	/** Direction of resize - horizontal only for now */
	direction?: "horizontal";
}

const emit = defineEmits<{
	(event: "update:modelValue", value: number): void;
	(event: "resize-number", size: number): void;
	(event: "resize-event", mouseEvent: MouseEvent): void;
	(event: "resize-start"): void;
	(event: "resize-end"): void;
	(event: "handle-mounted", element: HTMLElement): void;
}>();

const props = withDefaults(defineProps<ResizeHandleProps>(), {
	minWidth: 100,
	maxWidth: Infinity,
	direction: "horizontal",
});

const isResizing = ref(false);
const resizeHandleElement = ref<HTMLElement>();

const startResize = (event: MouseEvent) => {
	if (!props.resizableElement) return;

	event.preventDefault();
	isResizing.value = true;
	emit("resize-start");

	document.addEventListener("mousemove", handleResize);
	document.addEventListener("mouseup", stopResize);
	document.body.style.userSelect = "none";
	document.body.style.cursor = "col-resize";
};

const handleResize = (event: MouseEvent) => {
	if (!isResizing.value || !props.resizableElement) return;

	// Use the parent element to calculate the container bounds
	const containerRect = props.resizableElement.parentElement?.getBoundingClientRect();

	if (!containerRect) {
		console.warn("Resizable element has no parent element. Cannot calculate bounds.");
		return;
	}

	// Calculate position relative to the container's left edge
	const offsetX = event.clientX - containerRect.left;

	// Apply constraints
	const constrainedWidth = Math.max(props.minWidth, Math.min(props.maxWidth, offsetX));

	emit("resize-number", constrainedWidth);
	emit("resize-event", event);
};
const stopResize = () => {
	if (!isResizing.value) return;

	isResizing.value = false;
	emit("resize-end");
	cleanUpResize();
};

const cleanUpResize = () => {
	document.removeEventListener("mousemove", handleResize);
	document.removeEventListener("mouseup", stopResize);
	document.body.style.cursor = "";
	document.body.style.userSelect = "";
};

onMounted(() => {
	if (resizeHandleElement.value) {
		emit("handle-mounted", resizeHandleElement.value);
	}
});

onUnmounted(() => {
	cleanUpResize();
});
</script>

<template>
	<div
		ref="resizeHandleElement"
		class="flex w-1 h-full cursor-col-resize bg-black hover:bg-blue-500 transition-colors"
		:class="{ 'cursor-col-resizing': isResizing }"
		@mousedown="startResize"
	></div>
</template>
