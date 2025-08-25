using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Mappers;
using server.Models.Categories;
using server.Models.Comments;
using server.Models.Locations;
using server.Models.Locations.DTOs;
using server.Types.Enums;
using server.Types.Interfaces;

namespace server.Services
{
	public class CommentService(ApplicationDbContext context) : ICommentService
	{
		public async Task<IEnumerable<CommentDto>> GetAllCommentsForProjectAsync(Guid projectId)
		{
			try
			{
				IEnumerable<Comment> comments = await context.Comments
					.AsNoTracking()
					.Where(c => c.ProjectId == projectId)
					.Include(c => c.Project)
						.ThenInclude(p => p.Repository)
					.Include(c => c.Location)
					.Include(c => c.Category)
					.ToListAsync();
				return comments.Select(CommentMapper.ToDto);
			}
			catch (Exception ex)
			{
				throw new Exception($"Error retrieving comments for project {projectId}: {ex.Message}", ex);
			}
		}

		private static Location CreateLocationFromComment(CommentDto commentDto)
		{
			return commentDto.Type switch
			{
				CommentType.Singleline when commentDto.Location is SinglelineLocationDto lineLoc => new SinglelineLocation
				{
					Id = Guid.NewGuid(),
					FilePath = lineLoc.FilePath,
					LineNumber = lineLoc.LineNumber
				},
				CommentType.Multiline when commentDto.Location is MultilineLocationDto rangeLoc => new MultilineLocation
				{
					Id = Guid.NewGuid(),
					FilePath = rangeLoc.FilePath,
					StartLineNumber = rangeLoc.StartLineNumber,
					EndLineNumber = rangeLoc.EndLineNumber
				},
				CommentType.File when commentDto.Location is FileLocationDto fileLoc => new FileLocation
				{
					Id = Guid.NewGuid(),
					FilePath = fileLoc.FilePath,
					Description = fileLoc.Description ?? "File Comment"
				},
				CommentType.Project when commentDto.Location is ProjectLocationDto projLoc => new ProjectLocation
				{
					Id = Guid.NewGuid(),
					FilePath = projLoc.FilePath,
					Description = projLoc.Description ?? "Project Comment"
				},
				_ => throw new ArgumentException("Invalid or unknown comment type or location data")
			};
		}

		public async Task<CommentDto> CreateCommentAsync(Guid projectId, CommentDto newCommentData)
		{
			try
			{
				// Check if the project exists
				bool projectExists = await context.Projects.AnyAsync(p => p.Id == projectId);
				if (!projectExists)
					throw new ArgumentException($"Project with ID {projectId} does not exist.");

				// Get the category
				Category? category = await context.Categories.FirstOrDefaultAsync(cat => cat.Id == newCommentData.CategoryId);

				// Create and save the new location based on comment type
				Location newLocation = CreateLocationFromComment(newCommentData);
				await context.Locations.AddAsync(newLocation);

				// Create and save the new comment
				Comment newComment = new()
				{
					Id = Guid.NewGuid(),
					ProjectId = projectId,
					LocationId = newLocation.Id,
					CategoryId = category?.Id,
					Type = newCommentData.Type,
					Content = newCommentData.Content
				};
				await context.Comments.AddAsync(newComment);
				await context.SaveChangesAsync();

				// Retrieve the newly created comment with all related data
				Comment createdComment = await context.Comments
					.AsNoTracking()
					.Include(c => c.Project)
						.ThenInclude(p => p.Repository)
					.Include(c => c.Location)
					.Include(c => c.Category)
					.FirstOrDefaultAsync(c => c.Id == newComment.Id) 
					?? throw new Exception("Failed to retrieve the newly created comment.");
				return CommentMapper.ToDto(createdComment);
			}
			catch (Exception ex)
			{
				throw new Exception($"Error creating comment for project {projectId}: {ex.Message}", ex);
			}
		}

		public async Task<CommentDto> UpdateCommentAsync(Guid projectId, Guid commentId, CommentDto updatedCommentData)
		{
			try
			{
				// Ensure the project exists
				bool projectExists = await context.Projects.AnyAsync(p => p.Id == projectId);
				if (!projectExists)
					throw new ArgumentException($"Project with ID {projectId} does not exist.");
				
				// Find the existing comment
				Comment? existingComment = await context.Comments
					.Include(c => c.Location)
					.FirstOrDefaultAsync(c => c.Id == commentId && c.ProjectId == projectId);
				if (existingComment is null)
					throw new ArgumentException($"Comment with ID {commentId} for project {projectId} does not exist.");

				// Update the comment content
				// TODO: In the future update other attrs
				existingComment.Content = updatedCommentData.Content;
				context.Comments.Update(existingComment);
				await context.SaveChangesAsync();
				// Retrieve the updated comment with all related data
				Comment updatedComment = await context.Comments
					.AsNoTracking()
					.Include(c => c.Project)
						.ThenInclude(p => p.Repository)
					.Include(c => c.Location)
					.Include(c => c.Category)
					.FirstOrDefaultAsync(c => c.Id == existingComment.Id) 
					?? throw new Exception("Failed to retrieve the updated comment.");
				return CommentMapper.ToDto(updatedComment);
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
