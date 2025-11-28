import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	compatibilityDate: "2025-07-15",
	devtools: { enabled: false },
	srcDir: "app/",
	modules: ["@nuxt/icon", "@nuxtjs/i18n", "@pinia/nuxt"],
	css: ["~/assets/css/tailwind.css"],
	runtimeConfig: {
		public: {
			managerUrl: process.env.VITE_MANAGER_URL,
		},
	},
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			dedupe: ["@pinia/nuxt", "pinia"],
		},
	},
	i18n: {
		locales: [{ code: "en", file: "en.json", name: "English" }],
		defaultLocale: "en",
		langDir: "../i18n/locales",
	},
	nitro: {
		preset: "static",
	},
	components: [
		{
			path: "~/components",
			pathPrefix: false,
		},
	],
	app: {
		baseURL: process.env.VITE_CLIENT_BASE_PATHNAME,
		head: {
			charset: "utf-8",
			viewport: "width=device-width, initial-scale=1",
			title: "CodeComments | Client",
			meta: [{ name: "description", content: "Client application for code review projects" }],
			link: [
				{
					rel: "icon",
					type: "image/x-icon",
					href: `${process.env.VITE_CLIENT_BASE_PATHNAME}/favicon.ico`,
				},
			],
			script: [
				{
					src: "https://code.iconify.design/iconify-icon/2.0.0/iconify-icon.min.js",
					defer: true,
				},
			],
		},
	},
	extends: "../base",
});
