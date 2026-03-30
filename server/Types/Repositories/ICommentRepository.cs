using server.Models.Comments;

namespace server.Types.Repositories
{
    /// <summary>
    /// Defines data access operations for comments.
    /// </summary>
    public interface ICommentRepository
    {
        /// <summary>
        /// Returns all comments belonging to the specified project.
        /// </summary>
        Task<IEnumerable<Comment>> GetAllByProjectIdAsync(Guid projectId);

        /// <summary>
        /// Persists a new comment entity.
        /// </summary>
        Task<Comment> CreateAsync(Comment comment);

        /// <summary>
        /// Returns a comment by its ID within a project. Set track to true for update scenarios.
        /// </summary>
        Task<Comment?> GetByIdAsync(Guid commentId, Guid projectId, bool track = false);

        /// <summary>
        /// Returns all comments in a thread starting from the specified root comment.
        /// </summary>
        Task<IEnumerable<Comment>> GetThreadAsync(Guid rootCommentId, Guid projectId);

        /// <summary>
        /// Updates an existing comment entity.
        /// </summary>
        Task<Comment> UpdateAsync(Comment comment);

        /// <summary>
        /// Deletes a comment entity. Returns true if successful.
        /// </summary>
        Task<bool> DeleteAsync(Comment comment);
    }
}
