<script setup lang="ts">
import { ref } from "vue";
import { useKeyboardShortcutsStore } from "../../stores/keyboardShortcutsStore";
import Card from "../../lib/Card.vue";
import type { AppKeyboardShortcuts, KeyboardShortcut } from "../../types/others/KeyboardShortcuts";

// Variables
const keyboardShortcutsStore = useKeyboardShortcutsStore();
const editingShortcut = ref<string | null>(null);
const tempBinding = ref<string>("");

const startEditing = (action: string, currentBinding: string) => {
	editingShortcut.value = action;
	tempBinding.value = currentBinding;
};

const cancelEditing = () => {
	editingShortcut.value = null;
	tempBinding.value = "";
};

const saveShortcut = (shortcut: KeyboardShortcut) => {
	if (tempBinding.value.trim()) {
		const updatedShortcut = { ...shortcut, binding: tempBinding.value.trim() };
		keyboardShortcutsStore.updateShortcut(updatedShortcut);
	}
	editingShortcut.value = null;
	tempBinding.value = "";
};

const handleKeyCapture = (event: KeyboardEvent, shortcut: KeyboardShortcut) => {
	event.preventDefault();

	const modifiers = [];
	if (event.ctrlKey) modifiers.push("Ctrl");

	// Dont capture standalone modifier keys
	if (["Control", "Alt", "Shift", "Meta"].includes(event.key)) {
		return;
	}

	let key = event.key;
	if (key.length === 1) key = key.toLowerCase();

	const binding = modifiers.length > 0 ? `${modifiers.join("-")}-${key}` : key;
	tempBinding.value = binding;

	// Auto-save the shortcut
	saveShortcut(shortcut);
};

const onInputFocus = (action: string, currentBinding: string) => {
	startEditing(action, currentBinding);
};

const onInputBlur = () => {
	// Cancel editing if no valid shortcut was set
	cancelEditing();
};

const resetToDefault = () => {
	const defaultShortcuts: AppKeyboardShortcuts = keyboardShortcutsStore.getDefaultShortcuts;
	keyboardShortcutsStore.applyShortcuts(defaultShortcuts);
	keyboardShortcutsStore.saveShortcuts();
	editingShortcut.value = null;
};
</script>

<template>
	<Card class="bg-white">
		<div class="flex justify-between items-center mb-6">
			<h2 class="text-2xl font-bold">Keyboard Shortcuts</h2>
			<button
				@click="resetToDefault"
				class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
			>
				Reset to Default
			</button>
		</div>

		<div class="space-y-3">
			<div
				v-for="shortcut in keyboardShortcutsStore.getShortcuts"
				:key="shortcut.actionName"
				class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
			>
				<div class="flex justify-between items-center">
					<div class="flex-1">
						<h3 class="text-lg font-medium text-gray-900">{{ shortcut.actionName }}</h3>
					</div>

					<div class="flex items-center">
						<!-- Input that's always visible -->
						<input
							:value="
								editingShortcut === shortcut.actionName ? tempBinding : shortcut.binding || 'Not set'
							"
							@focus="onInputFocus(shortcut.actionName, shortcut.binding)"
							@blur="onInputBlur"
							@keydown="handleKeyCapture($event, shortcut)"
							class="px-3 py-1 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px] cursor-pointer"
							:class="{ 'text-gray-400': !shortcut.binding && editingShortcut !== shortcut.actionName }"
							readonly
						/>
					</div>
				</div>

				<!-- Help text when editing -->
				<div v-if="editingShortcut === shortcut.actionName" class="mt-2 text-sm text-gray-600">
					Press Ctrl + any key to set the shortcut. Release to save automatically.
				</div>
			</div>
		</div>
	</Card>
</template>
