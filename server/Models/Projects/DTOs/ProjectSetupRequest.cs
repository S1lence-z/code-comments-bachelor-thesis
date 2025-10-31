using System.ComponentModel.DataAnnotations;
using server.Types.Enums;

namespace server.Models.Projects.DTOs
{
    public record class ProjectSetupRequest
    {
        [Required]
        public string ServerBaseUrl { get; set; } = string.Empty;

		[Required]
        public string RepositoryUrl { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

		[Required]
        public string Branch { get; set; } = "main";

		public string CommitHash { get; set; } = string.Empty;

        [Required]
        public RepositoryType RepositoryType { get; set; } = RepositoryType.github;

        public string Token { get; set; } = string.Empty;
	}
}