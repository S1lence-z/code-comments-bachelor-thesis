using server.Models.Comments;

namespace server.Mappers
{
	public static class CommentMapper
	{
		public static CommentDto ToDto(Comment comment)
		{
			return new()
			{
				Id = comment.Id,
				Project = ProjectMapper.ToDto(comment.Project),
				Location = LocationMapper.ToDto(comment.Location),
				Type = comment.Type,
				Content = comment.Content,
				CategoryId = comment.CategoryId,
				Category = CategoryMapper.ToDto(comment.Category),
			};
		}
	}
}
