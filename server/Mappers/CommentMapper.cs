using server.Models.Comments;

namespace server.Mappers
{
	public static class CommentMapper
	{
		public static CommentDto ToDto(Comment comment, bool includeReplies = false)
		{
			return new()
			{
				Id = comment.Id,
				Project = comment.Project is not null ? ProjectMapper.ToDto(comment.Project) : null,
				Location = comment.Location is not null ? LocationMapper.ToDto(comment.Location) : null,
				Type = comment.Type,
				Content = comment.Content,
				CategoryId = comment.CategoryId,
				Category = comment.Category is null ? null : CategoryMapper.ToDto(comment.Category),
				RootCommentId = comment.RootCommentId,
				ParentCommentId = comment.ParentCommentId,
				Depth = comment.Depth,
				Replies = includeReplies && comment.DirectReplies.Count != 0
					? [.. comment.DirectReplies.OrderBy(r => r.CreatedAt).Select(r => ToDto(r, false))]
					: []
			};
		}
	}
}
