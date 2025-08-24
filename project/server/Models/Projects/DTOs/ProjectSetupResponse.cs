namespace server.Models.Projects.DTOs
{
	public record class ProjectSetupResponse
	{
		public ProjectDto Project { get; set; } = null!;
		public RepositoryDto Repository { get; set; } = null!;
	}
}
