using Microsoft.EntityFrameworkCore;
using server.Models.Comments;
using server.Models.Locations;
using server.Types.Repositories;

namespace server.Data.Repositories
{
    public class CommentRepository(ApplicationDbContext context) : ICommentRepository
    {
        public async Task<IEnumerable<Comment>> GetAllByProjectIdAsync(Guid projectId)
        {
            return await context.Comments
                .AsNoTracking()
                .Where(c => c.ProjectId == projectId)
                .Include(c => c.Project)
                    .ThenInclude(p => p.Repository)
                .Include(c => c.Location)
                .Include(c => c.Category)
				.ToListAsync();
        }

        public async Task<Comment> CreateAsync(Comment comment, Location location)
        {
            await context.Locations.AddAsync(location);
            await context.Comments.AddAsync(comment);
            await context.SaveChangesAsync();

            var created = await context.Comments
                .AsNoTracking()
                .Include(c => c.Project)
                    .ThenInclude(p => p.Repository)
                .Include(c => c.Location)
                .Include(c => c.Category)
				.FirstAsync(c => c.Id == comment.Id);
            return created;
        }

        public async Task<Comment?> GetByIdWithProjectAsync(Guid commentId, Guid projectId, bool track = false)
        {
            var query = context.Comments
                .Include(c => c.Project)
                    .ThenInclude(p => p.Repository)
                .Include(c => c.Location)
                .Include(c => c.Category)
                .Where(c => c.Id == commentId && c.ProjectId == projectId);

            return track ? await query.FirstOrDefaultAsync() : await query.AsNoTracking().FirstOrDefaultAsync();
        }

        public async Task<Comment> UpdateAsync(Comment comment)
        {
            context.Comments.Update(comment);
            await context.SaveChangesAsync();

            var updated = await context.Comments
                .AsNoTracking()
                .Include(c => c.Project)
                    .ThenInclude(p => p.Repository)
                .Include(c => c.Location)
                .Include(c => c.Category)
                .FirstAsync(c => c.Id == comment.Id);
            return updated;
        }

        public async Task<bool> DeleteAsync(Comment comment)
        {
            context.Comments.Remove(comment);
            return await context.SaveChangesAsync() > 0;
        }
    }
}
