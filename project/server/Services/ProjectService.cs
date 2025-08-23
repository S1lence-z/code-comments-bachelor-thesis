using server.Data;
using server.Interfaces;
using server.Models.Projects.DTOs;

namespace server.Services
{
	public class ProjectService(ApplicationDbContext context) : IProjectService
	{
		public Task<bool> SetupProjectAsync(ProjectSetupRequest request)
		{
			throw new NotImplementedException();
		}
	}
}
