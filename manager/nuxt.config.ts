import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: true,
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	modules: ["@nuxt/icon", "@nuxtjs/i18n"],
	css: ["~/assets/css/tailwind.css"],
	vite: {
		plugins: [tailwindcss()],
	},
	i18n: {
		locales: [{ code: "en", file: "en.json", name: "English" }],
	},
});
