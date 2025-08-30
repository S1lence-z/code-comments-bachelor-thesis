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
	<!-- Backdrop -->
	<div v-if="isVisible" class="fixed inset-0" @click="emit('update:isVisible', false)"></div>

	<!-- Panel -->
	<div v-if="isVisible" class="panel flex flex-col z-50 max-w-xl h-full" :class="props.class">
		<!-- Tools Panel -->
		<div class="flex flex-row justify-end">
			<span
				class="font-bold cursor-pointer hover:bg-amber-900 hover:rounded-xl p-2 text-black"
				@click="emit('update:isVisible', false)"
				>✕</span
			>
		</div>

		<div class="flex flex-col space-y-4">
			<!-- Header -->
			<div v-if="props.title" class="flex text-lg text-white">
				{{ props.title }}
			</div>

			<!-- Subtitle -->
			<div v-if="props.subtitle" class="text-md justify-start text-gray-300">
				{{ props.subtitle }}
			</div>

			<!-- Content -->
			<div class="justify-center items-center">
				<slot></slot>
			</div>
		</div>
	</div>
</template>
