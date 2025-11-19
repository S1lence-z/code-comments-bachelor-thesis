using server.Types.Enums;

namespace server.Models.Projects.DTOs
{
	public record class RepositoryDto
	{
		public Guid Id { get; set; }

		public string RepositoryType { get; set; } = "github";

		public string RepositoryUrl { get; set; } = string.Empty;

		public string Branch { get; set; } = "main";

		public string CommitHash { get; set; } = string.Empty;
	}
}
