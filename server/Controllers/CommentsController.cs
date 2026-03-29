using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models.Comments;
using server.Types.Interfaces;

namespace server.Controllers
{
	[Route("api/v1/project/{projectId}/comments")]
	[ApiController]
	/// <summary>
	/// Exposes CRUD endpoints for comments within a project, including threading support.
	/// </summary>
	public class CommentsController(ICommentService commentService) : ControllerBase
	{
		/// <summary>
		/// Returns all comments belonging to the specified project.
		/// </summary>
		[HttpGet]
		[AllowAnonymous]
		public async Task<IActionResult> GetAllCommentsForProject(Guid projectId)
		{
			IEnumerable<CommentDto> commentDtos = await commentService.GetAllCommentsForProjectAsync(projectId);
			return Ok(commentDtos);
		}

		/// <summary>
		/// Returns a single comment by its ID.
		/// </summary>
		[HttpGet("{commentId}")]
		[AllowAnonymous]
		public async Task<IActionResult> GetCommentById(Guid projectId, Guid commentId)
		{
			CommentDto? commentDto = await commentService.GetCommentByIdAsync(projectId, commentId);
			if (commentDto == null)
				return NotFound(new { message = "Comment not found" });
			return Ok(commentDto);
		}

		/// <summary>
		/// Returns the full thread of replies starting from the specified comment.
		/// </summary>
		[HttpGet("{commentId}/thread")]
		[AllowAnonymous]
		public async Task<IActionResult> GetCommentThread(Guid projectId, Guid commentId)
		{
			IEnumerable<CommentDto> thread = await commentService.GetThreadAsync(projectId, commentId);
			return Ok(thread);
		}

		/// <summary>
		/// Creates a new top-level comment in the specified project.
		/// </summary>
		[HttpPost]
		[Authorize]
		public async Task<IActionResult> CreateComment(Guid projectId, [FromBody] CommentDto newComment)
		{
			CommentDto commentDto = await commentService.CreateCommentAsync(projectId, newComment);
			return CreatedAtAction(nameof(GetCommentById), new { projectId, commentId = commentDto.Id }, commentDto);
		}

		/// <summary>
		/// Creates a reply to an existing comment, forming a thread.
		/// </summary>
		[HttpPost("{parentCommentId}/reply")]
		[AllowAnonymous]
		public async Task<IActionResult> CreateReply(Guid projectId, Guid parentCommentId, [FromBody] CommentDto newReply)
		{
			// Automatically set the parent comment ID from the route
			newReply.ParentCommentId = parentCommentId;

			CommentDto replyDto = await commentService.CreateCommentAsync(projectId, newReply);
			return CreatedAtAction(nameof(GetCommentById), new { projectId, commentId = replyDto.Id }, replyDto);
		}

		/// <summary>
		/// Updates an existing comment's content.
		/// </summary>
		[HttpPut("{commentId}")]
		[Authorize]
		public async Task<IActionResult> UpdateComment(Guid projectId, Guid commentId, [FromBody] CommentDto updatedCommentData)
		{
			CommentDto updatedComment = await commentService.UpdateCommentAsync(projectId, commentId, updatedCommentData);
			return Ok(updatedComment);
		}

		/// <summary>
		/// Deletes a comment by its ID.
		/// </summary>
		[HttpDelete("{commentId}")]
		[Authorize]
		public async Task<IActionResult> DeleteComment(Guid projectId, Guid commentId)
		{
			bool wasDeleted = await commentService.DeleteCommentAsync(projectId, commentId);
			if (wasDeleted)
				return NoContent();
			else
				return NotFound(new { message = "Comment not found" });
		}
	}
}
