using server.Models.Projects.DTOs;

namespace server.Interfaces
{
	public interface IProjectService
	{
		Task<bool> SetupProjectAsync(ProjectSetupRequest request);
	}
}
