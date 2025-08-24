using server.Models.Locations;
using server.Models.Projects;
using server.Types.Enums;

namespace server.Models.Comments
{
	public class CommentDto
	{
		public Guid Id { get; set; }
		public Project Project { get; set; } = null!;
		public Location Location { get; set; } = null!;
		public CommentType Type { get; set; }
		public string Content { get; set; } = string.Empty;
		public ICollection<string> Categories { get; set; } = [];
	}
}
