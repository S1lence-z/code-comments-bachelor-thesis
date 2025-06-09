import { CategoryRow, Project, Repository } from "../models/databaseModels.ts";
import { ProjectDto, RepositoryDto, CategoryDto } from "../models/dtoModels.ts";

export function repositoryToDto(repository: Repository): RepositoryDto {
	return {
		identifier: repository.identifier,
		type: repository.type,
		repoLandingPageUrl: repository.repo_landing_page_url,
	};
}

export function projectToDto(project: Project & { repository: Repository }): ProjectDto {
	const { repository } = project;

	if (!repository) {
		throw new Error("Project must have a repository");
	}

	if (!repository.repo_landing_page_url) {
		throw new Error("Repository must have a landing page URL");
	}

	const repositoryDto = repositoryToDto(repository);

	return {
		identifier: project.identifier,
		version: project.version,
		label: project.label,
		readApiUrl: project.read_api_url,
		writeApiUrl: project.write_api_url,
		repository: repositoryDto,
	};
}

export function categoryToDto(category: CategoryRow): CategoryDto {
	return {
		id: category.identifier,
		label: category.label,
		description: category.description,
	};
}
