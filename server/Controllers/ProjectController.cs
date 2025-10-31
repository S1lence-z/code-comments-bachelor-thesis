using Microsoft.AspNetCore.Mvc;
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
            IEnumerable<ProjectDto> projectDtos = await projectService.GetAllProjectsAsync();
            return Ok(projectDtos);
        }

		[HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectSetupRequest request)
        {
            ProjectDto projectDto = await projectService.SetupProjectAsync(request);
            return Created(nameof(CreateProject), projectDto);
		}
    }
}