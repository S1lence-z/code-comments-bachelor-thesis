import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { formatBasePath } from "./src/utils/base-path";

const env = loadEnv("", process.cwd());
const basePathname = formatBasePath(env.VITE_CLIENT_BASE_PATHNAME) || "";

// https://vite.dev/config/
export default defineConfig({
	base: basePathname,
	plugins: [vue(), tailwindcss()],
});
