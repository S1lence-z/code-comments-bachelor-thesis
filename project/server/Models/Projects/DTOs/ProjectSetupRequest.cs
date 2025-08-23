using System.ComponentModel.DataAnnotations;
using server.Enums;

namespace server.Models.Projects.DTOs
{
    public class ProjectSetupRequest
    {
        [Required]
        public string RepositoryUrl { get; set; } = string.Empty;

        [Required]
        public string Branch { get; set; } = "main";

        [Required]
        public string CommitHash { get; set; } = string.Empty;

        [Required]
        public RepositoryType RepositoryType { get; set; } = RepositoryType.git;

        [Required]
        public string Token { get; set; } = string.Empty;
	}
}