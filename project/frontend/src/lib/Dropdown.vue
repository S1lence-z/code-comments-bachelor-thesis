<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
	label: string;
	options: Array<{ label: string; value: any; actionCallback?: () => void }>;
	onChange?: (value: any) => void;
}>();

const showDropdown = ref(false);

const selectOption = (value: string) => {
	const selectedOption = props.options.find((option) => option.value === value);
	if (selectedOption && selectedOption?.actionCallback) {
		selectedOption.actionCallback();
		return;
	}
	// Else call onChange if provided ofc
	if (props.onChange) {
		props.onChange(value);
	}
};

const toggleDropdown = () => {
	showDropdown.value = !showDropdown.value;
};
</script>

<template>
	<div class="relative text-left">
		<button type="button" class="btn btn-secondary" @click="toggleDropdown">
			{{ props.label }}
		</button>
		<div v-if="showDropdown" class="absolute mt-2 w-full bg-gray-800 rounded-xl shadow-lg">
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
