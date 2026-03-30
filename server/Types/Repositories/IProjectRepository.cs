using server.Models.Projects;

namespace server.Types.Repositories
{
    /// <summary>
    /// Defines data access operations for projects and their associated repositories.
    /// </summary>
    public interface IProjectRepository
    {
        /// <summary>
        /// Returns all projects.
        /// </summary>
        Task<IEnumerable<Project>> GetAllAsync();

        /// <summary>
        /// Creates a new project together with its associated repository in a single transaction.
        /// </summary>
        Task<Project> CreateWithRepositoryAsync(Project project, Repository repository);

        /// <summary>
        /// Checks whether a project with the given ID exists.
        /// </summary>
        Task<bool> ExistsAsync(Guid projectId);
    }
}
