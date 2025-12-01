import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: false },
	srcDir: "app/",
	modules: ["@nuxt/icon", "@pinia/nuxt"],
	vite: {
		plugins: [tailwindcss()],
	},
});
