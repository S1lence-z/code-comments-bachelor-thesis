using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using server.Enums;

namespace server.Models.Projects
{
	public class Repository
	{
		[Key]
		public Guid Id { get; set; } = Guid.NewGuid();

		[Required]
		public Guid ProjectId { get; set; }

		[ForeignKey("ProjectId")]
		public virtual Project Project { get; set; } = null!;

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
