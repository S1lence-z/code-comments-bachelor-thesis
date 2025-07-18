<script setup lang="ts">
import { ref, provide, watch } from "vue";
import Panel from "./Panel.vue";
import type { PanelData } from "../../utils/panelUtils";
import { determineDropPosition, generateNewPanel } from "../../utils/panelUtils";

const props = defineProps<{
	selectedFilePath: string | null;
}>();

const emits = defineEmits<{
	(event: "update:selectedFilePath", value: string | null): void;
}>();

// Panel management
const panels = ref<PanelData[]>([]);
const draggedTab = ref<{ filePath: string; fromPanelId: string } | null>(null);
const leftDropZoneActive = ref(false);
const rightDropZoneActive = ref(false);
const dropZoneWidth = 200;
const panelIdCounter = ref(0);

const closePanel = (panelId: string) => {
	if (panels.value.length === 1) return; // Don't close the last panel

	const panelIndex = panels.value.findIndex((p) => p.id === panelId);
	if (panelIndex === -1) return;

	const panelToClose = panels.value[panelIndex];

	// If this panel has the active tab, switch to another panel
	if (panelToClose.activeTab === props.selectedFilePath) {
		const remainingPanels = panels.value.filter((p) => p.id !== panelId);
		const nextActivePanel = remainingPanels[0];
		if (nextActivePanel && nextActivePanel.activeTab) {
			emits("update:selectedFilePath", nextActivePanel.activeTab);
		} else {
			emits("update:selectedFilePath", null);
		}
	}

	// Remove panel
	panels.value.splice(panelIndex, 1);

	// Redistribute sizes
	if (panels.value.length > 0) {
		const remainingSize = 100 / panels.value.length;
		panels.value.forEach((panel) => {
			panel.size = remainingSize;
		});
	}
};

const addFileToPanel = (newFilePath: string) => {
	const activePanel = panels.value[0];
	if (!activePanel) return;

	if (!activePanel.openTabs.includes(newFilePath)) {
		activePanel.openTabs.push(newFilePath);
	}
	activePanel.activeTab = newFilePath;
};

// Tab management
const handleTabSelected = (filePath: string, panelId: string) => {
	const panel = panels.value.find((p) => p.id === panelId);
	if (!panel) return;

	panel.activeTab = filePath;
	emits("update:selectedFilePath", filePath);
};

const handleTabClosed = (filePath: string, panelId: string) => {
	const panel = panels.value.find((p) => p.id === panelId);
	if (!panel) {
		console.error("Panel not found for closed tab:", panelId);
		return;
	}

	const tabIndex = panel.openTabs.indexOf(filePath);
	if (tabIndex === -1) {
		console.error("Tab not found in panel:", filePath, panelId);
		return;
	}

	// Remove the tab from the panel
	panel.openTabs.splice(tabIndex, 1);
	if (panel.openTabs.length === 0) {
		// If no tabs left, close the panel
		closePanel(panelId);
		return;
	}
	// If the closed tab was the active tab, switch to the first tab
	if (panel.activeTab === filePath) {
		panel.activeTab = panel.openTabs[0];
		emits("update:selectedFilePath", panel.activeTab);
	}
};

// Drag and drop for drop zones (adding new panels)
const handleDropZoneDragOver = (event: DragEvent) => {
	event.preventDefault();

	if (draggedTab.value) {
		const container = event.currentTarget as HTMLElement;
		const containerRect = container.getBoundingClientRect();
		const relativeX = event.clientX - containerRect.left;
		// Show left drop zone
		leftDropZoneActive.value = relativeX <= dropZoneWidth;
		// Show right drop zone
		rightDropZoneActive.value = relativeX >= containerRect.width - dropZoneWidth;
	}
};

const handleDropZoneLeave = (event: DragEvent) => {
	// Only hide if we're leaving the entire container
	const currentTarget = event.currentTarget as HTMLElement;
	const relatedTarget = event.relatedTarget as HTMLElement;
	if (!currentTarget?.contains(relatedTarget)) {
		leftDropZoneActive.value = false;
		rightDropZoneActive.value = false;
	}
};

const handleDropZoneDrop = (event: DragEvent) => {
	event.preventDefault();
	leftDropZoneActive.value = false;
	rightDropZoneActive.value = false;

	// Only handle internal tab drops
	if (draggedTab.value) {
		const { filePath, fromPanelId } = draggedTab.value;
		const container = event.currentTarget as HTMLElement;
		const containerRect = container.getBoundingClientRect();
		const relativeX = event.clientX - containerRect.left;

		const sourcePanel = panels.value.find((p) => p.id === fromPanelId);
		if (!sourcePanel) return;

		// Determine drop position
		let insertPosition = determineDropPosition(relativeX, containerRect.width, dropZoneWidth, panels.value.length);
		if (insertPosition === null) {
			draggedTab.value = null;
			return;
		}

		// Remove from source panel
		const sourceIndex = sourcePanel.openTabs.indexOf(filePath);
		if (sourceIndex !== -1) {
			sourcePanel.openTabs.splice(sourceIndex, 1);
			if (sourcePanel.activeTab === filePath) {
				sourcePanel.activeTab = sourcePanel.openTabs[0] || null;
			}
		}

		// Create new panel
		const newPanel: PanelData = generateNewPanel(panelIdCounter, filePath);

		// Insert new panel at the determined position
		panels.value.splice(insertPosition, 0, newPanel);

		// Redistribute sizes
		const equalSize = 100 / panels.value.length;
		panels.value.forEach((panel) => {
			panel.size = equalSize;
		});

		// Make the moved file active
		emits("update:selectedFilePath", filePath);
		draggedTab.value = null;
	}
};

// Drag and drop for tabs (switching between panels)
const handleTabDragStart = (filePath: string, panelId: string) => {
	draggedTab.value = { filePath, fromPanelId: panelId };
};

const handleTabDragEnd = () => {
	draggedTab.value = null;
	leftDropZoneActive.value = false;
	rightDropZoneActive.value = false;
};

const handleTabDrop = (targetPanelId: string, insertIndex?: number) => {
	if (!draggedTab.value) return;

	const { filePath, fromPanelId } = draggedTab.value;

	// Don't allow dropping on the same panel
	if (fromPanelId === targetPanelId) {
		draggedTab.value = null;
		return;
	}

	const sourcePanel = panels.value.find((p) => p.id === fromPanelId);
	const targetPanel = panels.value.find((p) => p.id === targetPanelId);

	if (!sourcePanel || !targetPanel) return;

	// Remove from source panel
	const sourceIndex = sourcePanel.openTabs.indexOf(filePath);
	if (sourceIndex !== -1) {
		sourcePanel.openTabs.splice(sourceIndex, 1);

		// If this was the active tab in source panel, switch to another tab
		if (sourcePanel.activeTab === filePath) {
			sourcePanel.activeTab = sourcePanel.openTabs[0] || null;
		}
	}

	// Add to target panel
	if (insertIndex !== undefined) {
		targetPanel.openTabs.splice(insertIndex, 0, filePath);
	} else {
		targetPanel.openTabs.push(filePath);
	}

	// Make it active in target panel
	targetPanel.activeTab = filePath;
	emits("update:selectedFilePath", filePath);

	draggedTab.value = null;
};

// Provide context for child components
provide("splitPanelContext", {
	closePanel,
	handleTabDragStart,
	handleTabDragEnd,
	handleTabDrop,
	draggedTab: () => draggedTab.value,
});

const handleSelectedFilePathChange = (newFilePath: string | null) => {
	if (!newFilePath) return;
	if (panels.value.length === 0) {
		// If no panels exist, create a new one
		panels.value.push(generateNewPanel(panelIdCounter));
		// Set the first panel to take full width
		panels.value[0].size = 100;
	}

	// Check if file is already open in any panel
	const existingPanel = panels.value.find((panel) => panel.openTabs.includes(newFilePath));

	if (existingPanel) {
		// File is already open, just make it active
		existingPanel.activeTab = newFilePath;
	} else {
		// File is not open, add it to active panel
		addFileToPanel(newFilePath);
	}
};

// Watch for modelValue changes
watch(() => props.selectedFilePath, handleSelectedFilePathChange);
</script>

<template>
	<div
		id="split-panel-container"
		class="flex h-full w-full relative"
		@dragover="handleDropZoneDragOver"
		@dragleave="handleDropZoneLeave"
		@drop="handleDropZoneDrop"
	>
		<template v-for="(panel, _) in panels" :key="panel.id">
			<Panel
				:panel-id="panel.id"
				:open-tabs="panel.openTabs"
				:active-tab="panel.activeTab"
				:is-single-panel="panels.length === 1"
				:style="{ width: `${panel.size}%` }"
				@tab-selected="handleTabSelected"
				@tab-closed="handleTabClosed"
			>
				<slot :filePath="panel.activeTab" :panelId="panel.id"></slot>
			</Panel>
		</template>

		<!-- Left Drop Zone -->
		<div
			v-if="leftDropZoneActive"
			class="absolute left-0 top-0 h-full bg-blue-500/30 border-r-2 border-blue-500 flex items-center justify-center z-10"
			:style="{ width: dropZoneWidth + 'px' }"
		>
			<div class="text-blue-200 text-xs font-medium transform -rotate-90 whitespace-nowrap">New Panel</div>
		</div>

		<!-- Right Drop Zone -->
		<div
			v-if="rightDropZoneActive"
			class="absolute right-0 top-0 h-full bg-blue-500/30 border-l-2 border-blue-500 flex items-center justify-center z-10"
			:style="{ width: dropZoneWidth + 'px' }"
		>
			<div class="text-blue-200 text-xs font-medium transform -rotate-90 whitespace-nowrap">New Panel</div>
		</div>
	</div>
</template>
