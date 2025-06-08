import { z } from "zod";
import ISetupProjectBody from "../../../shared/api/ISetupProjectRequest.ts";

export const SetupProjectBodySchema = z.object({
	repoUrl: z.string().url("Invalid repository URL"),
	repoType: z.string().optional().default("git"),
	commit: z.string().optional().default(""),
	token: z.string().optional().default(""),
});

export type SetupProjectBody = z.infer<typeof SetupProjectBodySchema & ISetupProjectBody>;
