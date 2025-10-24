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
		ICategoryRepository categoryRepository) : ICommentService
	{
		public async Task<IEnumerable<CommentDto>> GetAllCommentsForProjectAsync(Guid projectId)
		{
			IEnumerable<Comment> comments = await commentRepository.GetAllByProjectIdAsync(projectId);
			return comments.Select(CommentMapper.ToDto);
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

		public async Task<CommentDto?> GetCommentByIdAsync(Guid projectId, Guid commentId)
		{
			Comment? comment = await commentRepository.GetByIdWithProjectAsync(commentId, projectId);
			return comment is null ? null : CommentMapper.ToDto(comment);
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

			// Create and save the new location based on comment type
			Location newLocation = CreateLocationFromComment(newCommentData);

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

			Comment createdComment = await commentRepository.CreateAsync(newComment, newLocation);
			logger.LogInformation("Created comment {CommentId} for project {ProjectId}", createdComment.Id, projectId);
			return CommentMapper.ToDto(createdComment);
		}

		public async Task<CommentDto> UpdateCommentAsync(Guid projectId, Guid commentId, CommentDto updatedCommentData)
		{
			// Find the existing comment
			Comment? existingComment = await commentRepository.GetByIdWithProjectAsync(commentId, projectId, track: true);
			if (existingComment is null)
			{
				logger.LogWarning("Attempted to update non-existent comment {CommentId} for project {ProjectId}", commentId, projectId);
				throw new ArgumentException($"Comment with ID {commentId} for project {projectId} does not exist.");
			}

			// Validate category if possible
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
			return CommentMapper.ToDto(updatedComment);
		}

		public async Task<bool> DeleteCommentAsync(Guid projectId, Guid commentId)
		{
			Comment? comment = await commentRepository.GetByIdWithProjectAsync(commentId, projectId, true);
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
