using server.Models.Categories;
using server.Models.Locations.DTOs;
using server.Models.Projects.DTOs;
using server.Types.Enums;

namespace server.Models.Comments
{
	public record class CommentDto
	{
		public Guid Id { get; set; }
		public ProjectDto? Project { get; set; }
		public LocationDto? Location { get; set; }
		public Guid? CategoryId { get; set; }
		public CategoryDto? Category { get; set; }
		public CommentType Type { get; set; }
		public string Content { get; set; } = string.Empty;
	}
}
