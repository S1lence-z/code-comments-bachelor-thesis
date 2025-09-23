using server.Models.Comments;
using server.Models.Locations;

namespace server.Types.Repositories
{
    public interface ICommentRepository
    {
        Task<IEnumerable<Comment>> GetAllByProjectIdAsync(Guid projectId);
        Task<Comment> CreateAsync(Comment comment, Location location);
        Task<Comment?> GetByIdWithProjectAsync(Guid commentId, Guid projectId, bool track = false);
        Task<Comment> UpdateAsync(Comment comment);
        Task<bool> DeleteAsync(Comment comment);
    }
}
