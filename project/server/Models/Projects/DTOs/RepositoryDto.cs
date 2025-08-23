using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using server.Enums;

namespace server.Models.Projects.DTOs
{
	public class RepositoryDto
	{
		public Guid Id { get; set; }

		public RepositoryType RepositoryType { get; set; } = RepositoryType.git;

		public string RepositoryUrl { get; set; } = string.Empty;

		public string Branch { get; set; } = "main";

		public string CommitHash { get; set; } = string.Empty;
	}
}
