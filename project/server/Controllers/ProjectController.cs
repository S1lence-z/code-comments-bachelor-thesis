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
                var result = await projectService.SetupProjectAsync(request);
                if (result)
                {
                    return Ok(new { message = "Project setup successfully." });
                }
                else
                {
                    return BadRequest(new { message = "Failed to set up project." });
                }
            }
            catch (Exception ex)
            {
                // Log the exception (not shown here for brevity)
                return StatusCode(500, new { message = "An error occurred while setting up the project.", error = ex.Message });
            }
        }
    }
}