using server.Models.Projects;
using server.Models.Projects.DTOs;

namespace server.Types.Interfaces
{
	public interface IProjectService
	{
		Task<ProjectDto> SetupProjectAsync(ProjectSetupRequest request);
		Task<IEnumerable<ProjectDto>> GetAllProjectsAsync();
	}
}
