using server.Data;
using server.Models.Projects.DTOs;
using server.Models.Projects;
using Microsoft.EntityFrameworkCore;
using server.Types.Interfaces;
using server.Mappers;
using Microsoft.Extensions.Options;
using server.Configs;

namespace server.Services
{
	public class ProjectService(ApplicationDbContext context, IOptions<ApiUrls> apiUrls) : IProjectService
	{
		private readonly string BASE_BACKEND_URL = apiUrls.Value.Backend;

		private static string GenerateReadWriteApiUrl(Guid projectId, string baseUrl)
		{
			return $"{baseUrl}/api/v1/project/{projectId}/comments";
		}

		public async Task<IEnumerable<ProjectDto>> GetAllProjectsAsync()
		{
			IEnumerable<Project> projects = await context.Projects.Include(p => p.Repository).ToListAsync();
			return projects.Select(ProjectMapper.ToDto);
		}

		public async Task<ProjectDto> SetupProjectAsync(ProjectSetupRequest request)
		{
			try
			{
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
				await context.Repositories.AddAsync(newRepository);

				// Validate if the server url in the request is the same as the base backend url
				if (request.ServerBaseUrl.TrimEnd('/') != BASE_BACKEND_URL.TrimEnd('/'))
					throw new Exception("The ServerBaseUrl must match the backend URL.");

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
				await context.Projects.AddAsync(newProject);
				await context.SaveChangesAsync();

				// Fetch the newly created project with its repository
				newProject = await context.Projects
					.AsNoTracking()
					.Include(p => p.Repository)
					.FirstAsync(p => p.Id == newProjectId);
				return ProjectMapper.ToDto(newProject);
			}
			catch (Exception ex)
			{
				throw new Exception($"Failed to set up project: {ex.Message}");
			}
		}
	}
}
