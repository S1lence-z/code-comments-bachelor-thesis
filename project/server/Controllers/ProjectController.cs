using Microsoft.AspNetCore.Mvc;
using server.Mappers;
using server.Models.Projects;
using server.Models.Projects.DTOs;
using server.Types.Interfaces;

namespace server.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ProjectController(IProjectService projectService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllProjects()
        {
            try
            {
                IEnumerable<ProjectDto> projectDtos = await projectService.GetAllProjectsAsync();
                return Ok(projectDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

		[HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectSetupRequest request)
        {
			try
            {
                ProjectDto projectDto = await projectService.SetupProjectAsync(request);
				return Created(nameof(CreateProject), projectDto);
			}
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
			}
		}
    }
}