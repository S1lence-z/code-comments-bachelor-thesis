import { createWebHistory, createRouter } from "vue-router";
import routes from "./routes.ts";

export const router = createRouter({
	history: createWebHistory("/code-comments-bachelor-thesis/"),
	routes,
});

export default router;
