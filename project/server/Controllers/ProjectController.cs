using Microsoft.AspNetCore.Mvc;
using server.Interfaces;
using server.Models.Projects.DTOs;

namespace server.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ProjectController(IProjectService projectService) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectSetupRequest request)
        {
			try
            {
                ProjectSetupResponse preparedResponse = await projectService.SetupProjectAsync(request);
                return Created(nameof(CreateProject), preparedResponse);
			}
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
			}
		}
    }
}