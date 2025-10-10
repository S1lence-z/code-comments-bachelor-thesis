/// <reference types="@types/web" />
import { createApp } from "vue";
import router from "./core/router";
import App from "./App.vue";
import { createPinia } from "pinia";
import "./../css/tailwind.css";
import { Icon } from "@iconify/vue";
import { createI18n } from "vue-i18n";
import en from "./locales/en.json";

const i18n = createI18n({
	locale: "en",
	fallbackLocale: "en",
	messages: {
		en,
	},
});

createApp(App).use(createPinia()).use(router).component("Icon", Icon).use(i18n).mount("#app");
