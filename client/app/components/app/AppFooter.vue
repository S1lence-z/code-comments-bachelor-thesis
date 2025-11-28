<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
	<footer class="bg-modern-black backdrop-blur-sm border-t border-white/10 px-6 py-4">
		<div class="max-w-7xl mx-auto">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<p class="text-slate-300 text-sm">{{ t("app.copyright") }}</p>
				</div>
			</div>
		</div>
	</footer>
</template>
