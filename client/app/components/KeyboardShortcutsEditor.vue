<script setup lang="ts">
import { Icon } from "@iconify/vue";

const { t } = useI18n();

interface KeyboardShortcutsEditorEmits {
	(event: "close"): void;
}
const emits = defineEmits<KeyboardShortcutsEditorEmits>();

// Store
const keyboardShortcutsStore = useKeyboardShortcutsStore();

// Track pending changes before saving
const pendingChanges = ref<Record<string, string>>({});

// Merge store shortcuts with any pending edits for display
const displayShortcuts = computed(() =>
	Object.values(keyboardShortcutsStore.getShortcuts).map((shortcut) => ({
		...shortcut,
		binding: pendingChanges.value[shortcut.actionName] ?? shortcut.binding,
	}))
);

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

	if (editingShortcutAction.value) {
		pendingChanges.value[editingShortcutAction.value] = binding;
	}
};

const resetToDefault = () => {
	pendingChanges.value = {};
	keyboardShortcutsStore.applyShortcuts(keyboardShortcutsStore.getDefaultShortcuts);
	editingShortcutAction.value = null;
};

const saveShortcuts = () => {
	for (const [actionName, binding] of Object.entries(pendingChanges.value)) {
		keyboardShortcutsStore.updateShortcut({ actionName, binding });
	}
	emits("close");
};
</script>

<template>
	<Card
		:title="t('keyboardShortcuts.title')"
		class="min-w-[600px] max-w-full mx-auto bg-slate-800/95"
	>
		<div class="space-y-4">
			<!-- Help text when editing -->
			<div class="flex items-center gap-2 text-slate-200">
				<Icon icon="mdi:info" class="w-5 h-5 text-blue-400" />
				<p class="text-base">{{ t("keyboardShortcuts.helpText") }}</p>
			</div>

			<div class="space-y-4">
				<div v-for="shortcut in displayShortcuts" :key="shortcut.actionName" class="space-y-2">
					<label class="block font-bold text-gray-400">{{ shortcut.actionName }}</label>
					<input
						:value="
							editingShortcutAction === shortcut.actionName
								? tempBinding
								: shortcut.binding || t('keyboardShortcuts.notSet')
						"
						@focus="startEditing(shortcut.actionName, shortcut.binding)"
						@keydown="handleKeyCapture($event)"
						class="box-border w-full p-3 text-base text-gray-200 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
						:class="{
							'text-gray-500': !shortcut.binding && editingShortcutAction !== shortcut.actionName,
						}"
						readonly
					/>
				</div>
			</div>

			<!-- Buttons -->
			<div class="flex justify-between items-center mt-6">
				<Button
					:label="t('keyboardShortcuts.resetToDefault')"
					buttonStyle="secondary"
					buttonSize="medium"
					@click="resetToDefault"
				/>
				<div class="flex space-x-3">
					<Button
						:label="t('keyboardShortcuts.cancel')"
						buttonStyle="secondary"
						buttonSize="medium"
						@click="() => emits('close')"
					/>
					<Button
						:label="t('keyboardShortcuts.save')"
						buttonStyle="primary"
						buttonSize="medium"
						@click="saveShortcuts"
					/>
				</div>
			</div>
		</div>
	</Card>
</template>
