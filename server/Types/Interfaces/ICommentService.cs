using server.Models.Comments;

namespace server.Types.Interfaces
{
	public interface ICommentService
	{
		Task<IEnumerable<CommentDto>> GetAllCommentsForProjectAsync(Guid projectId);
		Task<CommentDto> CreateCommentAsync(Guid projectId, CommentDto comment);
		Task<CommentDto> UpdateCommentAsync(Guid projectId, Guid commentId, CommentDto updatedComment);
		Task<bool> DeleteCommentAsync(Guid projectId, Guid commentId);
	}
}
