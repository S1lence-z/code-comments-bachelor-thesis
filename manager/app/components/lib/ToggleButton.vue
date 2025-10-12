<script setup lang="ts">
const props = defineProps<{
	label: string;
	isActive: boolean;
}>();

const emit = defineEmits<{
	(e: "update:isActive", value: boolean): void;
}>();

const toggleValue = () => {
	emit("update:isActive", !props.isActive);
};
</script>

<template>
	<div>
		<label class="flex items-center text-base cursor-pointer select-none" @click="toggleValue">
			<div
				class="relative w-12 h-6 transition-all duration-300 rounded-full cursor-pointer"
				:class="props.isActive ? 'bg-blue-500' : 'bg-gray-400'"
			>
				<div
					class="absolute w-4 h-4 transition-transform duration-300 ease-in-out bg-white rounded-full shadow-md top-1 left-1"
					:class="{ 'translate-x-6': props.isActive }"
				></div>
			</div>
			<span class="ml-4 text-white text-md">
				{{ props.label }}
			</span>
		</label>
	</div>
</template>
