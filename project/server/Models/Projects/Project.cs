using System.ComponentModel.DataAnnotations;

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
		public string ReadApiUrl { get; set; } = string.Empty;

		[Required]
		public string WriteApiUrl { get; set; } = string.Empty;
	}
}
