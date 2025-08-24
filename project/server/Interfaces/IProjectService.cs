using server.Models.Projects.DTOs;

namespace server.Interfaces
{
	public interface IProjectService
	{
		Task<ProjectSetupResponse> SetupProjectAsync(ProjectSetupRequest request);
	}
}
