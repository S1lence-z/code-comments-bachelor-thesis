using server.Models.Projects.DTOs;
using server.Models.Projects;
using server.Types.Interfaces;
using server.Mappers;
using Microsoft.Extensions.Options;
using server.Configs;
using server.Types.Repositories;

namespace server.Services
{
	public class ProjectService(
		ILogger<ProjectService> logger,
		IProjectRepository projectRepository, 
		IOptions<UrlSettings> apiUrls) : IProjectService
	{
		private readonly string _BASE_BACKEND_URL = apiUrls.Value.BackendUrl;

		private static string GenerateReadWriteApiUrl(Guid projectId, string baseUrl)
		{
			return $"{baseUrl}/api/v1/project/{projectId}/comments";
		}

		public async Task<IEnumerable<ProjectDto>> GetAllProjectsAsync()
		{
			IEnumerable<Project> projects = await projectRepository.GetAllAsync();
			return projects.Select(ProjectMapper.ToDto);
		}

		public async Task<ProjectDto> SetupProjectAsync(ProjectSetupRequest request)
		{
			// Validate if the server url in the request is the same as the base backend url
			if (request.ServerBaseUrl.TrimEnd('/') != _BASE_BACKEND_URL.TrimEnd('/'))
			{
				logger.LogWarning("Project setup failed: ServerBaseUrl mismatch. Expected: {Expected}, Got: {Actual}", 
					_BASE_BACKEND_URL, request.ServerBaseUrl);
				throw new ArgumentException("The ServerBaseUrl must match the backend URL.");
			}

			// Create new repository
			Guid newRepositoryId = Guid.NewGuid();
			Repository newRepository = new()
			{
				Id = newRepositoryId,
				RepositoryType = request.RepositoryType,
				RepositoryUrl = request.RepositoryUrl,
				Branch = request.Branch,
				CommitHash = request.CommitHash
			};

			// Create new project
			Guid newProjectId = Guid.NewGuid();
			Project newProject = new()
			{
				Id = newProjectId,
				Name = request.Name,
				ServerBaseUrl = request.ServerBaseUrl,
				ReadWriteApiUrl = GenerateReadWriteApiUrl(newProjectId, request.ServerBaseUrl),
				RepositoryId = newRepositoryId
			};

			Project createdProject = await projectRepository.CreateWithRepositoryAsync(newProject, newRepository);
			logger.LogInformation("Created project {ProjectId} with name '{ProjectName}'", createdProject.Id, createdProject.Name);
			return ProjectMapper.ToDto(createdProject);
		}
	}
}
