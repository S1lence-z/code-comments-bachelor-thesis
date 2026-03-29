using server.Models.Comments;

namespace server.Types.Interfaces
{
	/// <summary>
	/// Defines the contract for managing comments within a project, including CRUD and threading.
	/// </summary>
	public interface ICommentService
	{
		/// <summary>
		/// Returns all comments belonging to the specified project.
		/// </summary>
		Task<IEnumerable<CommentDto>> GetAllCommentsForProjectAsync(Guid projectId);

		/// <summary>
		/// Returns a single comment by its ID within a project, or null if not found.
		/// </summary>
		Task<CommentDto?> GetCommentByIdAsync(Guid projectId, Guid commentId);

		/// <summary>
		/// Returns the full thread of replies starting from the specified root comment.
		/// </summary>
		Task<IEnumerable<CommentDto>> GetThreadAsync(Guid projectId, Guid rootCommentId);

		/// <summary>
		/// Creates a new comment (or reply) in the specified project.
		/// </summary>
		Task<CommentDto> CreateCommentAsync(Guid projectId, CommentDto comment);

		/// <summary>
		/// Updates an existing comment's data.
		/// </summary>
		Task<CommentDto> UpdateCommentAsync(Guid projectId, Guid commentId, CommentDto updatedComment);

		/// <summary>
		/// Deletes a comment by its ID. Returns true if the comment was found and deleted.
		/// </summary>
		Task<bool> DeleteCommentAsync(Guid projectId, Guid commentId);
	}
}
