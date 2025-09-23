using Microsoft.EntityFrameworkCore;
using server.Models.Projects;
using server.Types.Repositories;

namespace server.Data.Repositories
{
    public class ProjectRepository(ApplicationDbContext context) : IProjectRepository
    {
        public async Task<IEnumerable<Project>> GetAllAsync()
        {
            return await context.Projects
                .AsNoTracking()
                .Include(p => p.Repository)
                .ToListAsync();
        }

        public async Task<Project> CreateWithRepositoryAsync(Project project, Repository repository)
        {
            await context.Repositories.AddAsync(repository);
            await context.Projects.AddAsync(project);
            await context.SaveChangesAsync();

            var created = await context.Projects
                .AsNoTracking()
                .Include(p => p.Repository)
                .FirstAsync(p => p.Id == project.Id);
            return created;
        }

        public async Task<bool> ExistsAsync(Guid projectId)
        {
            return await context.Projects.AnyAsync(p => p.Id == projectId);
        }
    }
}
