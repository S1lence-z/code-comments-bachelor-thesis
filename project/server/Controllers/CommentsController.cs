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
				IEnumerable<Comment> comments = await commentService.GetAllCommentsForProjectAsync(projectId);
				IEnumerable<CommentDto> commentDtos = comments.Select(CommentMapper.ToDto);
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
				Console.WriteLine(newComment);
				Comment createdComment = await commentService.CreateCommentAsync(projectId, newComment);
				CommentDto commentDto = CommentMapper.ToDto(createdComment);
				return CreatedAtAction(nameof(GetAllCommentsForProject), new { projectId, commentId = createdComment.Id }, commentDto);
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
				Comment updatedComment = await commentService.UpdateCommentAsync(projectId, commentId, updatedCommentData);
				CommentDto commentDto = CommentMapper.ToDto(updatedComment);
				return Ok(commentDto);
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
				bool deleted = await commentService.DeleteCommentAsync(projectId, commentId);
				if (deleted)
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
