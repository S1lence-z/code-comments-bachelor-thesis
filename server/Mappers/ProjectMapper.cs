using server.Models.Projects;
using server.Models.Projects.DTOs;

namespace server.Mappers
{
	public static class ProjectMapper
	{
		public static ProjectDto ToDto(Project project)
		{
			return new ProjectDto
			{
				Id = project.Id,
				Version = project.Version,
				Name = project.Name,
				ReadApiUrl = project.ReadApiUrl,
				WriteApiUrl = project.WriteApiUrl,
				Repository = RepositoryMapper.ToDto(project.Repository)
			};
		}
	}
}
