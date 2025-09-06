using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Query;
using server.Mappers;
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
			try
			{
				IEnumerable<CommentDto> commentDtos = await commentService.GetAllCommentsForProjectAsync(projectId);
				return Ok(commentDtos);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = ex.Message});
			}
		}

		[HttpPost]
		public async Task<IActionResult> CreateComment(Guid projectId, [FromBody] CommentDto newComment)
		{
			try
			{
				CommentDto commentDto = await commentService.CreateCommentAsync(projectId, newComment);
				return CreatedAtAction(nameof(GetAllCommentsForProject), new { projectId, commentId = commentDto.Id }, commentDto);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = ex.Message });
			}
		}

		[HttpPut("{commentId}")]
		public async Task<IActionResult> UpdateComment(Guid projectId, Guid commentId, [FromBody] CommentDto updatedCommentData)
		{
			try
			{
				CommentDto updatedComment = await commentService.UpdateCommentAsync(projectId, commentId, updatedCommentData);
				return Ok(updatedComment);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = ex.Message });
			}
		}

		[HttpDelete("{commentId}")]
		public async Task<IActionResult> DeleteComment(Guid projectId, Guid commentId)
		{
			try
			{
				bool wasDeleted = await commentService.DeleteCommentAsync(projectId, commentId);
				if (wasDeleted)
					return NoContent();
				else
					return NotFound(new { message = "Comment not found" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = ex.Message });
			}
		}
	}
}
