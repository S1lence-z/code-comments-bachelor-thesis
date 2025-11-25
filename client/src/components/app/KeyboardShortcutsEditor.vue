<script setup lang="ts">
import { ref } from "vue";
import { useKeyboardShortcutsStore } from "../../stores/keyboardShortcutsStore";
import Card from "../lib/Card.vue";
import type { AppKeyboardShortcuts } from "../../types/domain/keyboard-shortcuts";
import Button from "../lib/Button.vue";
import { objectDeepCopy } from "../../utils/json";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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
		<h2 class="text-2xl font-bold mb-4">{{ t("keyboardShortcuts.title") }}</h2>

		<!-- Help text when editing -->
		<div class="text-gray-600 flex items-center mb-4 gap-2">
			<Icon icon="mdi:info" class="w-6 h-6 text-blue-400" />
			<p class="text-black text-base">{{ t("keyboardShortcuts.helpText") }}</p>
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
									: shortcut.binding || t('keyboardShortcuts.notSet')
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
			<div class="flex justify-between mt-4">
				<div class="flex justify-start space-x-4">
					<Button
						:label="t('keyboardShortcuts.save')"
						buttonStyle="primary"
						buttonSize="medium"
						@click="saveShortcuts"
					/>
					<Button
						:label="t('keyboardShortcuts.cancel')"
						buttonStyle="secondary"
						buttonSize="medium"
						@click="() => emits('close')"
					/>
				</div>
				<Button
					:label="t('keyboardShortcuts.resetToDefault')"
					buttonStyle="secondary"
					buttonSize="medium"
					@click="resetToDefault"
				/>
			</div>
		</div>
	</Card>
</template>
