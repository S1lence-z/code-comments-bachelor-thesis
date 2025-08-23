using System.ComponentModel.DataAnnotations;

namespace server.Models.Projects.DTOs
{
	public class ProjectDto
	{
		public Guid Id { get; set; }

		public string Version { get; set; } = "1.0";

		public string Name { get; set; } = string.Empty;

		public string ReadApiUrl { get; set; } = string.Empty;

		public string WriteApiUrl { get; set; } = string.Empty;
	}
}
