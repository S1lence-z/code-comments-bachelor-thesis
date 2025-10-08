/// <reference types="@types/web" />
import { createApp } from "vue";
import router from "./core/router";
import App from "./App.vue";
import { createPinia } from "pinia";
import "./../css/tailwind.css";
import { Icon } from "@iconify/vue";

createApp(App).use(createPinia()).use(router).component("Icon", Icon).mount("#app");
