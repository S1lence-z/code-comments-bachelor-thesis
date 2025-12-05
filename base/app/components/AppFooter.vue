<script setup lang="ts">
import { Icon } from "@iconify/vue";

const MAILTO_PREFIX = "mailto:";

interface AppFooterProps {
	repoUrl?: string;
	contactEmail?: string;
}

const props = withDefaults(defineProps<AppFooterProps>(), {
	repoUrl: "https://github.com/S1lence-z/code-comments-bachelor-thesis",
	contactEmail: `${MAILTO_PREFIX}test@example.com`,
});
</script>

<template>
	<footer class="border-t border-white/10 bg-modern-black">
		<div class="mx-auto px-6 py-8 max-w-7xl md:flex md:items-center md:justify-between">
			<!-- Name and copyright -->
			<div class="text-center text-slate-400 mb-6 md:mb-0">
				<p>&copy; 2025 Code Comments. All rights reserved.</p>
			</div>

			<!-- Links -->
			<div class="flex items-center justify-center gap-8">
				<a
					:href="props.repoUrl"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
				>
					<Icon icon="mdi:github" class="w-5 h-5" />
					<span>GitHub</span>
				</a>
				<a
					:href="`${MAILTO_PREFIX}${props.contactEmail}`"
					class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
				>
					<Icon icon="mdi:email" class="w-5 h-5" />
					<span>Contact</span>
				</a>
			</div>
		</div>
	</footer>
</template>
