/// <reference types="@types/web" />
import { createApp } from "vue";
import router from "./core/router";
import App from "./App.vue";
import { createPinia } from "pinia";
import "./../css/tailwind.css";

createApp(App).use(createPinia()).use(router).mount("#app");
