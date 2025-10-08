<script setup lang="ts">
import { ref } from "vue";
import { useKeyboardShortcutsStore } from "../../stores/keyboardShortcutsStore";
import Card from "../../lib/Card.vue";
import type { AppKeyboardShortcuts } from "../../types/others/KeyboardShortcuts";
import Button from "../../lib/Button.vue";
import { objectDeepCopy } from "../../utils/jsonUtils";

interface KeyboardShortcutsEditorEmits {
	(event: "close"): void;
}

const emits = defineEmits<KeyboardShortcutsEditorEmits>();

// Store
const keyboardShortcutsStore = useKeyboardShortcutsStore();

// State - Deep copy of store shortcuts to avoid direct mutation
const allShortcuts = ref<AppKeyboardShortcuts>(objectDeepCopy(keyboardShortcutsStore.getShortcuts));

// Editing state
const editingShortcutAction = ref<string | null>(null);
const tempBinding = ref<string>("");

const startEditing = (action: string, currentBinding: string) => {
	editingShortcutAction.value = action;
	tempBinding.value = currentBinding;
};

const handleKeyCapture = (event: KeyboardEvent) => {
	event.preventDefault();

	if (!event.ctrlKey) {
		return;
	}

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

	// Update the local state
	if (editingShortcutAction.value) {
		const shortcut = Object.values(allShortcuts.value).find(
			(shortcut) => shortcut.actionName === editingShortcutAction.value
		);

		if (shortcut) {
			shortcut.binding = binding;
		}
	}
};

const resetToDefault = () => {
	const defaultShortcuts: AppKeyboardShortcuts = keyboardShortcutsStore.getDefaultShortcuts;
	allShortcuts.value = defaultShortcuts;
	editingShortcutAction.value = null;
};

const saveShortcuts = () => {
	// Apply all shortcuts to the store
	Object.values(allShortcuts.value).forEach((shortcut) => {
		keyboardShortcutsStore.updateShortcut(shortcut);
	});
	emits("close");
};
</script>

<template>
	<Card class="bg-white">
		<!-- Header -->
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-2xl font-bold">Keyboard Shortcuts</h2>
			<button
				@click="resetToDefault"
				class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
			>
				Reset to Default
			</button>
		</div>

		<!-- Help text when editing -->
		<div class="text-gray-600 flex items-center mb-4 gap-2">
			<Icon icon="mdi:info" class="w-7 h-7 text-blue-400" />
			<p class="text-black text-base">Press Ctrl + any key to set the shortcut</p>
		</div>

		<div class="space-y-3">
			<div
				v-for="shortcut in allShortcuts"
				:key="shortcut.actionName"
				class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
			>
				<div class="flex justify-between items-center">
					<div class="flex-1">
						<h3 class="text-lg font-medium text-gray-900">{{ shortcut.actionName }}</h3>
					</div>

					<div class="flex items-center">
						<input
							:value="
								editingShortcutAction === shortcut.actionName
									? tempBinding
									: shortcut.binding || 'Not set'
							"
							@focus="startEditing(shortcut.actionName, shortcut.binding)"
							@keydown="handleKeyCapture($event)"
							class="px-3 py-1 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px] cursor-pointer"
							:class="{
								'text-gray-400': !shortcut.binding && editingShortcutAction !== shortcut.actionName,
							}"
							readonly
						/>
					</div>
				</div>
			</div>
			<!-- Buttons -->
			<Button label="Save" type="button" buttonStyle="primary" :onClick="saveShortcuts" class="mt-2 mr-2" />
			<Button label="Cancel" type="button" buttonStyle="secondary" :onClick="() => emits('close')" class="mt-2" />
		</div>
	</Card>
</template>
