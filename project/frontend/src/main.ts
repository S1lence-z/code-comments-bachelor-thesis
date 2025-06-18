/// <reference types="@types/web" />
import { createApp } from "vue";
import router from "./core/router";
import App from "./App.vue";
import "./css/generated.css";

createApp(App).use(router).mount("#app");
