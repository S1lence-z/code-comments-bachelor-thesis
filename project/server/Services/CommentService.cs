using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models.Comments;
using server.Models.Locations;
using server.Types.Enums;
using server.Types.Interfaces;

namespace server.Services
{
	public class CommentService(ApplicationDbContext context) : ICommentService
	{
		public async Task<IEnumerable<Comment>> GetAllCommentsForProjectAsync(Guid projectId)
		{
			try
			{
				IEnumerable<Comment> comments = await context.Comments
					.AsNoTracking()
					.Where(c => c.ProjectId == projectId)
					.Include(c => c.Project)
						.ThenInclude(p => p.Repository)
					.Include(c => c.Location)
					.Include(c => c.Categories)
					.ToListAsync();
				return comments;
			}
			catch (Exception ex)
			{
				throw new Exception($"Error retrieving comments for project {projectId}: {ex.Message}", ex);
			}
		}

		private static Location CreateLocationByCommentType(CommentType commentType)
		{
			return commentType switch
			{
				CommentType.Singleline => new LineLocation { Id = Guid.NewGuid() },
				CommentType.Multiline => new LineRange { Id = Guid.NewGuid() },
				CommentType.File => new OtherLocation { Id = Guid.NewGuid() },
				CommentType.Project => new OtherLocation { Id = Guid.NewGuid() },
				_ => throw new ArgumentException($"Unsupported comment type: {commentType}", nameof(commentType))
			};
		}

		public async Task<Comment> CreateCommentAsync(Guid projectId, CommentDto newCommentData)
		{
			try
			{
				bool projectExists = await context.Projects.AnyAsync(p => p.Id == projectId);
				if (!projectExists)
					throw new ArgumentException($"Project with ID {projectId} does not exist.");

				// Create and save the new location based on comment type
				var newLocation = CreateLocationByCommentType(newCommentData.Type);
				await context.Locations.AddAsync(newLocation);

				// Create and save the new comment
				Comment newComment = new()
				{
					Id = Guid.NewGuid(),
					ProjectId = projectId,
					LocationId = newLocation.Id,
					Type = newCommentData.Type,
					Content = newCommentData.Content,
					Categories = [] // TODO: Handle categories properly
				};
				await context.Comments.AddAsync(newComment);
				await context.SaveChangesAsync();

				// Retrieve the newly created comment with all related data
				Comment createdComment = await context.Comments
					.AsNoTracking()
					.Include(c => c.Project)
						.ThenInclude(p => p.Repository)
					.Include(c => c.Location)
					.Include(c => c.Categories)
					.FirstOrDefaultAsync(c => c.Id == newComment.Id) 
					?? throw new Exception("Failed to retrieve the newly created comment.");
				return createdComment;
			}
			catch (Exception ex)
			{
				throw new Exception($"Error creating comment for project {projectId}: {ex.Message}", ex);
			}
		}

		public Task<Comment> UpdateCommentAsync(Guid projectId, Guid commentId, CommentDto updatedComment)
		{
			try
			{
				throw new NotImplementedException("UpdateCommentAsync is not implemented yet.");
			}
			catch (Exception ex)
			{
				throw new Exception($"Error updating comment {commentId} for project {projectId}: {ex.Message}", ex);
			}
		}

		public async Task<bool> DeleteCommentAsync(Guid projectId, Guid commentId)
		{
			try
			{
				Comment? comment = await context.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.ProjectId == projectId);
				if (comment is null)
					throw new ArgumentException($"Comment with ID {commentId} for project {projectId} does not exist.");
				context.Comments.Remove(comment);
				int affectedRows = await context.SaveChangesAsync();
				return affectedRows > 0;
			}
			catch (Exception ex)
			{
				throw new Exception($"Error deleting comment {commentId} for project {projectId}: {ex.Message}", ex);
			}
		}
	}
}
