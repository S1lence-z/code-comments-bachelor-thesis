using server.Models.Projects;
using server.Models.Projects.DTOs;

namespace server.Types.Interfaces
{
	public interface IProjectService
	{
		Task<(Project, Repository)> SetupProjectAsync(ProjectSetupRequest request);
		Task<IEnumerable<Project>> GetAllProjectsAsync();
	}
}
