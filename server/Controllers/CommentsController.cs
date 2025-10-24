using Microsoft.AspNetCore.Mvc;
using server.Models.Comments;
using server.Types.Interfaces;

namespace server.Controllers
{
	[Route("api/v1/project/{projectId}/comments")]
	[ApiController]
	public class CommentsController(ICommentService commentService) : ControllerBase
	{
		[HttpGet]
		public async Task<IActionResult> GetAllCommentsForProject(Guid projectId)
		{
			IEnumerable<CommentDto> commentDtos = await commentService.GetAllCommentsForProjectAsync(projectId);
			return Ok(commentDtos);
		}

		[HttpGet("{commentId}")]
		public async Task<IActionResult> GetCommentById(Guid projectId, Guid commentId)
		{
			CommentDto? commentDto = await commentService.GetCommentByIdAsync(projectId, commentId);
			if (commentDto == null)
				return NotFound(new { message = "Comment not found" });
			return Ok(commentDto);
		}

		[HttpPost]
		public async Task<IActionResult> CreateComment(Guid projectId, [FromBody] CommentDto newComment)
		{
			CommentDto commentDto = await commentService.CreateCommentAsync(projectId, newComment);
			return CreatedAtAction(nameof(CreateComment), new { projectId, commentId = commentDto.Id}, commentDto);
		}

		[HttpPut("{commentId}")]
		public async Task<IActionResult> UpdateComment(Guid projectId, Guid commentId, [FromBody] CommentDto updatedCommentData)
		{
			CommentDto updatedComment = await commentService.UpdateCommentAsync(projectId, commentId, updatedCommentData);
			return Ok(updatedComment);
		}

		[HttpDelete("{commentId}")]
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
