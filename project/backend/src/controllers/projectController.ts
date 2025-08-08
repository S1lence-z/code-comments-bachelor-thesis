import { SetupProjectBody } from "../models/requestModels";
import { projectToDto } from "../utils/mappers";
import { ProjectDto } from "../models/dtoModels";
import ProjectService from "../services/projectService";

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
