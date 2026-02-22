namespace server.Models.Projects.DTOs
{
	public record class ProjectDto
	{
		public Guid Id { get; set; }

		public string Version { get; set; } = "1.0";

		public string Name { get; set; } = string.Empty;

		public string ServerBaseUrl { get; set; } = string.Empty;

		public RepositoryDto Repository { get; set; } = null!;
	}
}
