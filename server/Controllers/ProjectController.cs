using Microsoft.AspNetCore.Authorization;
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
        [AllowAnonymous]
        public async Task<IActionResult> GetAllProjects()
        {
            IEnumerable<ProjectDto> projectDtos = await projectService.GetAllProjectsAsync();
            return Ok(projectDtos);
        }

		[HttpPost]
        [Authorize]
		public async Task<IActionResult> CreateProject([FromBody] ProjectSetupRequest request)
        {
            ProjectDto projectDto = await projectService.SetupProjectAsync(request);
            return Created(nameof(CreateProject), projectDto);
		}
    }
}