using server.Models.Comments;

namespace server.Types.Interfaces
{
	public interface ICommentService
	{
		Task<IEnumerable<CommentDto>> GetAllCommentsForProjectAsync(Guid projectId);
		Task<CommentDto?> GetCommentByIdAsync(Guid projectId, Guid commentId);
		Task<IEnumerable<CommentDto>> GetThreadAsync(Guid projectId, Guid rootCommentId);
		Task<CommentDto> CreateCommentAsync(Guid projectId, CommentDto comment);
		Task<CommentDto> UpdateCommentAsync(Guid projectId, Guid commentId, CommentDto updatedComment);
		Task<bool> DeleteCommentAsync(Guid projectId, Guid commentId);
	}
}
