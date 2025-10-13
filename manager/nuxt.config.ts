import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: true,
	compatibilityDate: "2025-07-15",
	devtools: { enabled: false },
	srcDir: "app/",
	runtimeConfig: {
		public: {
			defaultServerUrl: process.env.VITE_SERVER_URL,
			clientUrl: process.env.VITE_CLIENT_URL,
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
			title: "Manager | CodeComments",
			meta: [{ name: "description", content: "Setup and manage your code review projects" }],
		},
	},
});
