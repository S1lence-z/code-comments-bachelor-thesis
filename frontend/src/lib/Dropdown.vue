<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
	label: string;
	options: Array<{ label: string; value: any; actionCallback?: () => void }>;
	onChange?: (value: any) => void;
}>();

const showDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const selectOption = (value: string) => {
	const selectedOption = props.options.find((option) => option.value === value);
	if (selectedOption && selectedOption?.actionCallback) {
		selectedOption.actionCallback();
		closeDropdown();
		return;
	}
	// Else call onChange if provided ofc
	if (props.onChange) {
		props.onChange(value);
	}
	closeDropdown();
};

const toggleDropdown = () => {
	showDropdown.value = !showDropdown.value;
	if (showDropdown.value) {
		setTimeout(() => dropdownRef.value?.focus(), 0);
	}
};

const closeDropdown = () => {
	showDropdown.value = false;
};

const handleBlur = (event: FocusEvent) => {
	if (!dropdownRef.value?.contains(event.relatedTarget as Node)) {
		closeDropdown();
	}
};
</script>

<template>
	<div
		ref="dropdownRef"
		class="relative text-left outline-none"
		tabindex="0"
		@blur="handleBlur"
		@keydown.escape="closeDropdown"
	>
		<button type="button" class="btn btn-secondary" @click="toggleDropdown">
			{{ props.label }}
		</button>
		<div v-if="showDropdown" class="absolute mt-2 w-full bg-gray-800 rounded-xl shadow-lg z-20">
			<ul>
				<li
					v-for="option in props.options"
					:key="option.value"
					class="hover:bg-gray-600 cursor-pointer text-white px-4 py-2"
					:class="{
						'rounded-t-xl': option === props.options[0],
						'rounded-b-xl': option === props.options[props.options.length - 1],
					}"
					@click="selectOption(option.value)"
				>
					{{ option.label }}
				</li>
			</ul>
		</div>
	</div>
</template>
