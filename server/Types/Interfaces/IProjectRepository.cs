using server.Models.Projects;

namespace server.Types.Interfaces
{
    public interface IProjectRepository
    {
        Task<IEnumerable<Project>> GetAllAsync();
        Task<Project> CreateWithRepositoryAsync(Project project, Repository repository);
        Task<bool> ExistsAsync(Guid projectId);
    }
}
