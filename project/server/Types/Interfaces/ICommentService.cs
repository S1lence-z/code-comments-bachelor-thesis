using server.Models.Comments;

namespace server.Types.Interfaces
{
	public interface ICommentService
	{
		Task<IEnumerable<Comment>> GetAllCommentsForProjectAsync(Guid projectId);
		Task<Comment> CreateCommentAsync(Guid projectId, CommentDto comment);
		Task<Comment> UpdateCommentAsync(Guid projectId, Guid commentId, CommentDto updatedComment);
		Task<bool> DeleteCommentAsync(Guid projectId, Guid commentId);
	}
}
