using server.Mappers;
using server.Models.Categories;
using server.Models.Locations.DTOs;
using server.Models.Projects.DTOs;
using server.Types.Enums;

namespace server.Models.Comments
{
	public record class CommentDto
	{
		public Guid Id { get; set; }
		public ProjectDto Project { get; set; } = null!;
		public LocationDto Location { get; set; } = null!;
		public CommentType Type { get; set; }
		public string Content { get; set; } = string.Empty;
		public ICollection<CategoryDto> Categories { get; set; } = [];

		public static CommentDto From(Comment comment) => new()
		{
			Id = comment.Id,
			Project = ProjectMapper.ToDto(comment.Project),
			Location = LocationMapper.ToDto(comment.Location),
			Type = comment.Type,
			Content = comment.Content,
			Categories = comment.Categories.Select(CategoryMapper.ToDto).ToList()
		};
	}
}
