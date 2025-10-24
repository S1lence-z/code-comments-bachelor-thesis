using Microsoft.EntityFrameworkCore;
using server.Models.Comments;
using server.Types.Repositories;

namespace server.Data.Repositories
{
	public class CommentRepository(ApplicationDbContext context) : ICommentRepository
	{
		public async Task<IEnumerable<Comment>> GetAllByProjectIdAsync(Guid projectId)
		{
			return await context.Comments
				.AsNoTracking()
				.Where(c => c.ProjectId == projectId && c.RootCommentId == null)
				.Include(c => c.Project)
					.ThenInclude(p => p.Repository)
				.Include(c => c.Location)
				.Include(c => c.Category)
				.Include(c => c.DirectReplies)
					.ThenInclude(r => r.Category)
					.OrderByDescending(c => c.CreatedAt)
				.ToListAsync();
		}

		public async Task<Comment?> GetByIdAsync(Guid commentId, Guid projectId, bool track = false)
		{
			var query = context.Comments
				.Include(c => c.Project)
					.ThenInclude(p => p.Repository)
				.Include(c => c.Location)
				.Include(c => c.Category)
				.Where(c => c.Id == commentId && c.ProjectId == projectId);

			return track ? await query.FirstOrDefaultAsync() : await query.AsNoTracking().FirstOrDefaultAsync();
		}

		public async Task<IEnumerable<Comment>> GetThreadAsync(Guid commentId, Guid projectId)
		{
			// First, get the comment to determine the rootComment
			Comment? comment = await context.Comments
				.AsNoTracking()
				.FirstOrDefaultAsync(c => c.Id == commentId && c.ProjectId == projectId);

			if (comment is null)
				return [];

			// Determine the actual rootComment comment ID
			Guid rootId = comment.RootCommentId ?? comment.Id;

			// Get the rootComment
			Comment? rootComment = await context.Comments
				.AsNoTracking()
				.Include(c => c.Project)
					.ThenInclude(p => p.Repository)
				.Include(c => c.Location)
				.Include(c => c.Category)
				.FirstOrDefaultAsync(c => c.Id == rootId && c.ProjectId == projectId);

			if (rootComment is null)
				return [];

			// Get all replies in the thread
			IEnumerable<Comment> replies = await context.Comments
				.AsNoTracking()
				.Where(c => c.RootCommentId == rootId && c.ProjectId == projectId)
				.Include(c => c.Category)
				.OrderBy(c => c.CreatedAt)
				.ToListAsync();

			return new[] { rootComment }.Concat(replies);
		}

		public async Task<Comment> CreateAsync(Comment comment)
		{
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
