using server.Models.Projects;
using server.Models.Projects.DTOs;

namespace server.Types.Interfaces
{
	/// <summary>
	/// Defines the contract for creating and retrieving projects.
	/// </summary>
	public interface IProjectService
	{
		/// <summary>
		/// Creates and configures a new project from the provided setup request.
		/// </summary>
		Task<ProjectDto> SetupProjectAsync(ProjectSetupRequest request);

		/// <summary>
		/// Returns all projects as DTOs.
		/// </summary>
		Task<IEnumerable<ProjectDto>> GetAllProjectsAsync();
	}
}
