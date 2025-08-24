using Microsoft.AspNetCore.Mvc;

namespace server.Controllers
{
	[Route("api/v1/project/{projectId}/comments")]
	[ApiController]
	public class CommentsController : ControllerBase
	{
		[HttpGet]
		public IActionResult GetAllCommentsForProject(Guid projectId)
		{
			return Ok();
		}

		[HttpPost]
		public IActionResult CreateComment(Guid projectId)
		{
			return CreatedAtAction(nameof(GetAllCommentsForProject), new { projectId }, null);
		}

		[HttpPut("{commentId}")]
		public IActionResult UpdateComment(Guid projectId, Guid commentId)
		{
			return NoContent();
		}

		[HttpDelete("{commentId}")]
		public IActionResult DeleteComment(Guid projectId, Guid commentId)
		{
			return NoContent();
		}
	}
}
