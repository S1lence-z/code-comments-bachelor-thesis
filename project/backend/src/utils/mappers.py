from models.domain_models import ProjectModel, RepositoryModel
from models.dtos import ProjectDto, RepositoryDto

def repository_to_dto(repository_model: RepositoryModel) -> RepositoryDto:
    return RepositoryDto(
        identifier=repository_model.identifier,
        type=repository_model.type,
        repoLandingPageUrl=repository_model.repo_landing_page_url
    )

def project_to_dto(project: ProjectModel) -> ProjectDto:
    repository = project.repository

    if not repository:
        raise ValueError("Project must have a repository")
    if not repository.repo_landing_page_url:
        raise ValueError("Repository must have a landing page URL")
    
    repository_dto = RepositoryDto(
        identifier=repository.identifier,
        type=repository.type,
        repoLandingPageUrl=repository.repo_landing_page_url
    )
    
    return ProjectDto(
        identifier=project.identifier,
        version=project.version,
        label=project.label,
        readApiUrl=str(project.read_api_url),
        writeApiUrl=str(project.write_api_url),
        repositoryId=repository.identifier,
        repository=repository_dto
    )
