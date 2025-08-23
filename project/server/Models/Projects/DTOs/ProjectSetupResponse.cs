namespace server.Models.Projects.DTOs
{
	public class ProjectSetupResponse
	{
		public ProjectDto Project { get; set; } = null!;
		public RepositoryDto Repository { get; set; } = null!;
	}
}
