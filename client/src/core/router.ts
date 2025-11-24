import { createWebHistory, createRouter } from "vue-router";
import routes from "./routes.ts";
import { formatBasePath } from "../utils/base-path.ts";

const basePathname = formatBasePath(import.meta.env.VITE_CLIENT_BASE_PATHNAME) || "";

export const router = createRouter({
	history: createWebHistory(basePathname),
	routes,
});

export default router;
