using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models.Projects
{
	public record class Project
	{
		[Key]
		public Guid Id { get; set; } = Guid.NewGuid();

		[Required]
		public string Name { get; set; } = string.Empty;

		[Required]
		public string Version { get; set; } = "1.0";
		
		[Required]
		public string ServerBaseUrl { get; set; } = string.Empty;

		[Required]
		public Guid RepositoryId { get; set; }

		[ForeignKey("RepositoryId")]
		public virtual Repository Repository { get; set; } = null!;
	}
}
