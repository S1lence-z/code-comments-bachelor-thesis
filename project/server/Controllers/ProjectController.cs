using Microsoft.AspNetCore.Mvc;
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
                IEnumerable<Project> projects = await projectService.GetAllProjectsAsync();
                IEnumerable<ProjectDto> projectDtos = projects.Select(p => ProjectDto.From(p, p.Repository));
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
                var (newProject, newRepository) = await projectService.SetupProjectAsync(request);
                ProjectDto projectDto = ProjectDto.From(newProject, newRepository);
				return Created(nameof(CreateProject), projectDto);
			}
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
			}
		}
    }
}