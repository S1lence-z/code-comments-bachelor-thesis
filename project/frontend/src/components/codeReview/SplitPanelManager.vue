<script setup lang="ts">
import { ref, computed, provide } from "vue";
import Panel from "./Panel.vue";

export interface PanelData {
	id: string;
	openTabs: string[];
	activeTab: string | null;
	splitDirection?: "horizontal" | "vertical";
	size?: number; // percentage of parent container
}

const props = defineProps<{
	modelValue: string | null;
}>();

const emits = defineEmits<{
	(event: "update:modelValue", value: string | null): void;
}>();

// Panel management
const panels = ref<PanelData[]>([
	{
		id: "panel-1",
		openTabs: [],
		activeTab: null,
		size: 100,
	},
]);

const draggedTab = ref<{ filePath: string; fromPanelId: string } | null>(null);

// Get active panel (the one with the currently selected file)
const activePanelId = computed(() => {
	return panels.value.find((panel) => panel.activeTab === props.modelValue)?.id || panels.value[0]?.id;
});

// Split panel functions
const splitPanelHorizontally = (panelId: string) => {
	const panelIndex = panels.value.findIndex((p) => p.id === panelId);
	if (panelIndex === -1) return;

	const currentPanel = panels.value[panelIndex];
	const newPanelId = `panel-${Date.now()}`;

	// Resize current panel to 50%
	currentPanel.size = 50;
	currentPanel.splitDirection = "horizontal";

	// Create new panel
	const newPanel: PanelData = {
		id: newPanelId,
		openTabs: [],
		activeTab: null,
		size: 50,
	};

	// Insert new panel after current one
	panels.value.splice(panelIndex + 1, 0, newPanel);
};

const splitPanelVertically = (panelId: string) => {
	const panelIndex = panels.value.findIndex((p) => p.id === panelId);
	if (panelIndex === -1) return;

	const currentPanel = panels.value[panelIndex];
	const newPanelId = `panel-${Date.now()}`;

	// Resize current panel to 50%
	currentPanel.size = 50;
	currentPanel.splitDirection = "vertical";

	// Create new panel
	const newPanel: PanelData = {
		id: newPanelId,
		openTabs: [],
		activeTab: null,
		size: 50,
	};

	// Insert new panel after current one
	panels.value.splice(panelIndex + 1, 0, newPanel);
};

const closePanel = (panelId: string) => {
	if (panels.value.length === 1) return; // Don't close the last panel

	const panelIndex = panels.value.findIndex((p) => p.id === panelId);
	if (panelIndex === -1) return;

	const panelToClose = panels.value[panelIndex];

	// If this panel has the active tab, switch to another panel
	if (panelToClose.activeTab === props.modelValue) {
		const remainingPanels = panels.value.filter((p) => p.id !== panelId);
		const nextActivePanel = remainingPanels[0];
		if (nextActivePanel && nextActivePanel.activeTab) {
			emits("update:modelValue", nextActivePanel.activeTab);
		} else {
			emits("update:modelValue", null);
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

// Tab management
const handleTabSelected = (filePath: string, panelId: string) => {
	const panel = panels.value.find((p) => p.id === panelId);
	if (!panel) return;

	panel.activeTab = filePath;
	emits("update:modelValue", filePath);
};

const handleTabClosed = (filePath: string, panelId: string) => {
	const panel = panels.value.find((p) => p.id === panelId);
	if (!panel) return;

	const tabIndex = panel.openTabs.indexOf(filePath);
	if (tabIndex !== -1) {
		panel.openTabs.splice(tabIndex, 1);

		// If this was the active tab, switch to another tab in the same panel
		if (panel.activeTab === filePath) {
			panel.activeTab = panel.openTabs[0] || null;
			emits("update:modelValue", panel.activeTab);
		}
	}
};

// Drag and drop
const handleTabDragStart = (filePath: string, panelId: string) => {
	draggedTab.value = { filePath, fromPanelId: panelId };
};

const handleTabDragEnd = () => {
	draggedTab.value = null;
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
	emits("update:modelValue", filePath);

	draggedTab.value = null;
};

// Watch for new files being opened
const addFileToActivePanel = (filePath: string) => {
	const activePanel = panels.value.find((p) => p.id === activePanelId.value);
	if (!activePanel) return;

	if (!activePanel.openTabs.includes(filePath)) {
		activePanel.openTabs.push(filePath);
	}
	activePanel.activeTab = filePath;
};

// Watch for modelValue changes to add new files
const handleModelValueChange = (newFilePath: string | null) => {
	if (!newFilePath) return;

	// Check if file is already open in any panel
	const existingPanel = panels.value.find((panel) => panel.openTabs.includes(newFilePath));

	if (existingPanel) {
		// File is already open, just make it active
		existingPanel.activeTab = newFilePath;
	} else {
		// File is not open, add it to active panel
		addFileToActivePanel(newFilePath);
	}
};

// Watch for modelValue changes
import { watch } from "vue";
watch(() => props.modelValue, handleModelValueChange);

// Provide context for child components
provide("splitPanelContext", {
	splitPanelHorizontally,
	splitPanelVertically,
	closePanel,
	handleTabDragStart,
	handleTabDragEnd,
	handleTabDrop,
	draggedTab: () => draggedTab.value,
});
</script>

<template>
	<div class="split-panel-manager h-full w-full flex">
		<Panel
			v-for="panel in panels"
			:key="panel.id"
			:panel-id="panel.id"
			:open-tabs="panel.openTabs"
			:active-tab="panel.activeTab"
			:size="panel.size"
			:split-direction="panel.splitDirection"
			:is-single-panel="panels.length === 1"
			@tab-selected="handleTabSelected"
			@tab-closed="handleTabClosed"
		>
			<slot :filePath="panel.activeTab" :panelId="panel.id"></slot>
		</Panel>
	</div>
</template>

<style scoped>
.split-panel-manager {
	display: flex;
	height: 100%;
}
</style>
