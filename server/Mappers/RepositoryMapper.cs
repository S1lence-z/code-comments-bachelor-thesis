using server.Models.Projects;
using server.Models.Projects.DTOs;

namespace server.Mappers
{
	public static class RepositoryMapper
	{
		public static RepositoryDto ToDto(Repository repository)
		{
			return new()
			{
				Id = repository.Id,
				RepositoryType = repository.RepositoryType,
				RepositoryUrl = repository.RepositoryUrl,
				Branch = repository.Branch,
				CommitHash = repository.CommitHash
			};
		}
	}
}
