using server.Mappers;
using server.Models.Comments;
using server.Models.Categories;
using server.Models.Locations;
using server.Models.Locations.DTOs;
using server.Types.Enums;
using server.Types.Interfaces;
using server.Types.Repositories;

namespace server.Services
{
	public class CommentService(
		ILogger<CommentService> logger,
		ICommentRepository commentRepository,
		IProjectRepository projectRepository,
		ILocationRepository locationRepository,
		ICategoryRepository categoryRepository) : ICommentService
	{
		public async Task<IEnumerable<CommentDto>> GetAllCommentsForProjectAsync(Guid projectId)
		{
			IEnumerable<Comment> comments = await commentRepository.GetAllByProjectIdAsync(projectId);
			return comments.Select(c => CommentMapper.ToDto(c, includeReplies: false));
		}

		public async Task<CommentDto?> GetCommentByIdAsync(Guid projectId, Guid commentId)
		{
			Comment? comment = await commentRepository.GetByIdAsync(commentId, projectId);
			return comment is null ? null : CommentMapper.ToDto(comment, includeReplies: false);
		}

		public async Task<IEnumerable<CommentDto>> GetThreadAsync(Guid projectId, Guid rootCommentId)
		{
			IEnumerable<Comment> thread = await commentRepository.GetThreadAsync(rootCommentId, projectId);
			if (!thread.Any())
			{
				logger.LogWarning("Attempted to get thread for non-existent root comment {RootCommentId} in project {ProjectId}", rootCommentId, projectId);
				throw new ArgumentException($"Comment thread with root ID {rootCommentId} does not exist for project {projectId}.");
			}

			return thread.Select(c => CommentMapper.ToDto(c, includeReplies: false));
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
			// Check if the project exists
			bool projectExists = await projectRepository.ExistsAsync(projectId);
			if (!projectExists)
			{
				logger.LogWarning("Attempted to create comment for non-existent project {ProjectId}", projectId);
				throw new ArgumentException($"Project with ID {projectId} does not exist.");
			}

			// Validate category
			Category? category = await categoryRepository.GetByIdAsync(newCommentData.CategoryId);

			Location? newLocation;
			Guid? rootCommentId = null;
			int depth = 0;

			// Handle reply comments
			if (newCommentData.ParentCommentId.HasValue)
			{
				Comment? parentComment = await commentRepository.GetByIdAsync(newCommentData.ParentCommentId.Value, projectId);
				if (parentComment is null)
				{
					logger.LogWarning("Attempted to create reply to non-existent comment {ParentCommentId} for project {ProjectId}", 
						newCommentData.ParentCommentId.Value, projectId);
					throw new ArgumentException($"Parent comment with ID {newCommentData.ParentCommentId.Value} does not exist for project {projectId}.");
				}

				// Inherit location from parent
				newLocation = parentComment.Location;
				// Set root comment ID
				rootCommentId = parentComment.RootCommentId ?? parentComment.Id;
				// Increment depth
				depth = parentComment.Depth + 1;
			}
			// Handle new root comments
			else
			{
				newLocation = CreateLocationFromComment(newCommentData);
				await locationRepository.CreateAsync(newLocation);
			}

			// Create and save the new comment
			Comment newComment = new()
			{
				Id = Guid.NewGuid(),
				ProjectId = projectId,
				LocationId = newLocation.Id,
				CategoryId = category?.Id,
				Type = newCommentData.Type,
				Content = newCommentData.Content,
				ParentCommentId = newCommentData.ParentCommentId,
				RootCommentId = rootCommentId,
				Depth = depth,
				CreatedAt = DateTime.UtcNow
			};

			Comment createdComment = await commentRepository.CreateAsync(newComment);
			logger.LogInformation("Created comment {CommentId} (depth: {Depth}) for project {ProjectId}", 
				createdComment.Id, depth, projectId);
			return CommentMapper.ToDto(createdComment, false);
		}

		public async Task<CommentDto> UpdateCommentAsync(Guid projectId, Guid commentId, CommentDto updatedCommentData)
		{
			// Find the existing comment
			Comment? existingComment = await commentRepository.GetByIdAsync(commentId, projectId, true);
			if (existingComment is null)
			{
				logger.LogWarning("Attempted to update non-existent comment {CommentId} for project {ProjectId}", commentId, projectId);
				throw new ArgumentException($"Comment with ID {commentId} for project {projectId} does not exist.");
			}

			// Validate category if provided
			if (updatedCommentData.CategoryId.HasValue)
			{
				bool categoryExists = await categoryRepository.ExistsAsync(updatedCommentData.CategoryId.Value);
				if (!categoryExists)
				{
					logger.LogWarning("Attempted to update comment with non-existent category {CategoryId}", updatedCommentData.CategoryId.Value);
					throw new ArgumentException($"Category with ID {updatedCommentData.CategoryId.Value} does not exist.");
				}
			}

			// Update the comment content and categoryId
			existingComment.Content = updatedCommentData.Content;
			existingComment.CategoryId = updatedCommentData.CategoryId;

			// Persist changes
			Comment updatedComment = await commentRepository.UpdateAsync(existingComment);
			logger.LogInformation("Updated comment {CommentId} for project {ProjectId}", commentId, projectId);
			return CommentMapper.ToDto(updatedComment, false);
		}

		public async Task<bool> DeleteCommentAsync(Guid projectId, Guid commentId)
		{
			Comment? comment = await commentRepository.GetByIdAsync(commentId, projectId, track: true);
			if (comment is null)
			{
				logger.LogWarning("Attempted to delete non-existent comment {CommentId} for project {ProjectId}", commentId, projectId);
				throw new ArgumentException($"Comment with ID {commentId} for project {projectId} does not exist.");
			}

			bool result = await commentRepository.DeleteAsync(comment);
			if (result)
			{
				logger.LogInformation("Deleted comment {CommentId} for project {ProjectId}", commentId, projectId);
			}
			return result;
		}
	}
}
