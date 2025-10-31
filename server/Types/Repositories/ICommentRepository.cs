using server.Models.Comments;

namespace server.Types.Repositories
{
    public interface ICommentRepository
    {
        Task<IEnumerable<Comment>> GetAllByProjectIdAsync(Guid projectId);
        Task<Comment> CreateAsync(Comment comment);
        Task<Comment?> GetByIdAsync(Guid commentId, Guid projectId, bool track = false);
        Task<IEnumerable<Comment>> GetThreadAsync(Guid rootCommentId, Guid projectId);
        Task<Comment> UpdateAsync(Comment comment);
        Task<bool> DeleteAsync(Comment comment);
    }
}
