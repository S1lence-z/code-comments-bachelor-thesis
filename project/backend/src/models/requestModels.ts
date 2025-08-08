import { z } from "zod";
import ISetupProjectBody from "../../../shared/api/ISetupProjectRequest";

export const SetupProjectBodySchema = z.object({
	repoUrl: z.string().url("Invalid repository URL"),
	branch: z.string(),
	commit: z.string().optional().default(""),
	repoType: z.string().optional().default("git"),
	token: z.string().optional().default(""),
});

export type SetupProjectBody = z.infer<typeof SetupProjectBodySchema & ISetupProjectBody>;
