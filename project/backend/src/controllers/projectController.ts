import { SetupProjectBody } from "../models/requestModels.ts";
import { projectToDto } from "../utils/mappers.ts";
import { ProjectDto } from "../models/dtoModels.ts";
import ProjectService from "../services/projectService.ts";

class ProjectController {
	public static createProject(
		projectService: ProjectService,
		validatedBody: SetupProjectBody,
		frontendBaseUrl: string,
		backendBaseUrl: string
	): ProjectDto {
		const requestData = {
			git_repo_url: validatedBody.repoUrl,
			branch: validatedBody.branch,
			repo_type: validatedBody.repoType,
			commit: validatedBody.commit,
			token: validatedBody.token,
			frontend_base_url: frontendBaseUrl,
			backend_base_url: backendBaseUrl,
		};

		const newProject = projectService.createProject(requestData);
		const newProjectDto: ProjectDto = projectToDto(newProject);
		return newProjectDto;
	}
}

export default ProjectController;
