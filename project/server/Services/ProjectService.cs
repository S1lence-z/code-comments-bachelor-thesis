using server.Data;
using server.Interfaces;
using server.Models.Projects.DTOs;
using server.Models.Projects;
using Microsoft.EntityFrameworkCore;

namespace server.Services
{
	public class ProjectService(ApplicationDbContext context) : IProjectService
	{
		// TODO: Add this to environment variables
		private readonly string BASE_BACKEND_URL = "http://localhost:5234";

		private string GenerateApiUrl(Guid projectId)
		{
			return $"{BASE_BACKEND_URL}/api/v1/project/{projectId}/comments";
		}

		public async Task<IEnumerable<Project>> GetAllProjectsAsync()
		{
			IEnumerable<Project> projects = await context.Projects.Include(p => p.Repository).ToListAsync();
			return projects;
		}

		public async Task<(Project, Repository)> SetupProjectAsync(ProjectSetupRequest request)
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

				// Create new project
				Guid newProjectId = Guid.NewGuid();
				string readWriteApiUrl = GenerateApiUrl(newProjectId);
				Project newProject = new()
				{
					Id = newProjectId,
					Name = request.ProjectName,
					ReadApiUrl = readWriteApiUrl,
					WriteApiUrl = readWriteApiUrl,
					RepositoryId = newRepositoryId
				};
				await context.Projects.AddAsync(newProject);
				await context.SaveChangesAsync();
				return (newProject, newRepository);
			}
			catch (Exception ex)
			{
				throw new Exception($"Failed to set up project: {ex.Message}");
			}
		}
	}
}
