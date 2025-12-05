<script setup lang="ts">
const { t } = useI18n();

const emit = defineEmits<{
	(event: "handleSwitchOfflineMode"): void;
}>();

const settingsStore = useSettingsStore();
</script>

<template>
	<!-- Toggle Buttons -->
	<div class="flex flex-col justify-start space-y-6">
		<!-- Toggle Button for Sidebar -->
		<ToggleButton
			:label="t('settings.showSidebar')"
			:isActive="settingsStore.sidebarOpenState"
			@update:isActive="settingsStore.toggleSidebarOpen"
		/>
		<!-- Toggle Button for Keyboard Mode -->
		<ToggleButton
			:label="t('settings.keyboardMode')"
			:isActive="settingsStore.keyboardModeOnState"
			@update:isActive="settingsStore.toggleKeyboardMode"
		/>
		<!-- Save workspace to local storage -->
		<ToggleButton
			:label="t('settings.saveWorkspace')"
			:isActive="settingsStore.saveWorkspaceState"
			@update:isActive="settingsStore.toggleSaveWorkspace"
		/>
		<!-- Toggle Button for Compact Comment Mode -->
		<ToggleButton
			:label="t('settings.compactCommentWidget')"
			:isActive="settingsStore.compactCommentWidgetState"
			@update:isActive="settingsStore.toggleCompactCommentWidget"
		/>
		<!-- Button for Toggling Offline Mode -->
		<ToggleButton
			:label="t('settings.offlineMode')"
			:isActive="settingsStore.offlineModeState"
			@update:isActive="emit('handleSwitchOfflineMode')"
		/>
		<!-- Divider -->
		<div class="border-t border-white w-full"></div>
		<!-- Button for Editing Keyboard Shortcuts -->
		<Button
			:label="t('settings.editKeyboardShortcuts')"
			type="button"
			buttonStyle="primary"
			buttonSize="medium"
			@click="settingsStore.toggleKeyboardShortcutsEditor"
		/>
		<!-- Button for Editing Repository Auth -->
		<Button
			:label="t('settings.editRepositoryAuth')"
			type="button"
			buttonStyle="primary"
			buttonSize="medium"
			@click="settingsStore.toggleRepositoryAuthEditor"
		/>
	</div>
</template>
