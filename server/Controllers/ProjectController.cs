using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models.Projects.DTOs;
using server.Types.Interfaces;

namespace server.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    /// <summary>
    /// Exposes endpoints for listing and creating projects.
    /// </summary>
    public class ProjectController(IProjectService projectService) : ControllerBase
    {
        /// <summary>
        /// Returns all projects.
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllProjects()
        {
            IEnumerable<ProjectDto> projectDtos = await projectService.GetAllProjectsAsync();
            return Ok(projectDtos);
        }

		/// <summary>
		/// Creates a new project with the provided setup configuration.
		/// </summary>
		[HttpPost]
        [Authorize]
		public async Task<IActionResult> CreateProject([FromBody] ProjectSetupRequest request)
        {
            ProjectDto projectDto = await projectService.SetupProjectAsync(request);
            return Created(nameof(CreateProject), projectDto);
		}
    }
}