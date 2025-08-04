<script setup lang="ts">
interface SlideoutPanelProps {
	title?: string;
	subtitle?: string;
	class?: string;
	isVisible: boolean;
}

const props = withDefaults(defineProps<SlideoutPanelProps>(), {
	isVisible: true,
});

const emit = defineEmits(["update:isVisible"]);
</script>

<template>
	<div v-if="isVisible" class="panel flex flex-col z-auto max-w-xl w-full h-full" :class="props.class">
		<!-- Tools Panel -->
		<div class="flex flex-row justify-end">
			<span class="font-bold cursor-pointer" @click="emit('update:isVisible', false)">X</span>
		</div>

		<div class="flex flex-col">
			<!-- Header -->
			<div v-if="props.title" class="flex text-lg font-bold">
				{{ props.title }}
			</div>

			<!-- Subtitle -->
			<div v-if="props.subtitle" class="text-md font-light justify-start">
				{{ props.subtitle }}
			</div>

			<!-- Content -->
			<div class="mx-auto justify-center items-center">
				<slot></slot>
			</div>
		</div>
	</div>
</template>
