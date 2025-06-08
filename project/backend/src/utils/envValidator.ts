import { z } from "zod";

const EnvSchema = z.object({
	BACKEND_API_PORT: z
		.string()
		.default("3500")
		.transform(Number)
		.pipe(z.number().int().min(1).max(65535)),
	BACKEND_HOSTNAME: z.string().default("http://localhost"),
	FRONTEND_BASE_URL: z.string().url().default("http://localhost:5173"),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	DB_PATH: z.string().optional(),
});

export type ValidatedEnv = z.infer<typeof EnvSchema>;

export function validateEnv(): ValidatedEnv {
	try {
		const env = {
			BACKEND_API_PORT: Deno.env.get("BACKEND_API_PORT") || "3500",
			BACKEND_HOSTNAME: Deno.env.get("BACKEND_HOSTNAME") || "http://localhost",
			FRONTEND_BASE_URL: Deno.env.get("FRONTEND_BASE_URL") || "http://localhost:5173",
			NODE_ENV: Deno.env.get("NODE_ENV") || "development",
			DB_PATH: Deno.env.get("DB_PATH"),
		};

		return EnvSchema.parse(env);
	} catch (error) {
		console.error("Environment validation failed:", error);
		throw new Error("Invalid environment configuration");
	}
}

export function logEnvironment(env: ValidatedEnv): void {
	console.log("=== Environment Configuration ===");
	console.log(`Mode: ${env.NODE_ENV}`);
	console.log(`Backend: ${env.BACKEND_HOSTNAME}:${env.BACKEND_API_PORT}`);
	console.log(`Frontend: ${env.FRONTEND_BASE_URL}`);
	console.log(`Database: ${env.DB_PATH || "default location"}`);
	console.log("================================");
}
