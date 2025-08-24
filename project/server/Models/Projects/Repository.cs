using System.ComponentModel.DataAnnotations;
using server.Enums;

namespace server.Models.Projects
{
	public record class Repository
	{
		[Key]
		public Guid Id { get; set; } = Guid.NewGuid();

		[Required]
		public RepositoryType RepositoryType { get; set; } = RepositoryType.git;

		[Required]
		public string RepositoryUrl { get; set; } = string.Empty;

		[Required]
		public string Branch { get; set; } = "main";

		[Required]
		public string CommitHash { get; set; } = string.Empty;
	}
}
