import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: true,
	compatibilityDate: "2025-07-15",
	devtools: { enabled: false },
	srcDir: "app/",
	runtimeConfig: {
		public: {
			// Default backend URL - can be overridden by NUXT_PUBLIC_API_BASE_URL env var
			apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:5234",
			// Viewer app URL for redirects
			viewerUrl: process.env.NUXT_PUBLIC_VIEWER_URL || "http://localhost:5173",
		},
	},
	modules: ["@nuxt/icon", "@nuxtjs/i18n"],
	css: ["~/assets/css/tailwind.css"],
	vite: {
		plugins: [tailwindcss()],
	},
	i18n: {
		locales: [{ code: "en", file: "en.json", name: "English" }],
		defaultLocale: "en",
		langDir: "../i18n/locales",
	},
	nitro: {
		preset: "node-server",
		compressPublicAssets: true,
	},
	components: [
		{
			path: "~/components",
			pathPrefix: false,
		},
	],
	app: {
		head: {
			charset: "utf-8",
			viewport: "width=device-width, initial-scale=1",
			title: "Code Review Manager",
			meta: [{ name: "description", content: "Setup and manage your code review projects" }],
		},
	},
});
