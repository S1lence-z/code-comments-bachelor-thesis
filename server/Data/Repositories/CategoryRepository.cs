using Microsoft.EntityFrameworkCore;
using server.Models.Categories;
using server.Types.Interfaces;

namespace server.Data.Repositories
{
    public class CategoryRepository(ApplicationDbContext context) : ICategoryRepository
    {
        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await context.Categories.AsNoTracking().ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(Guid? categoryId)
        {
            if (categoryId is null) return null;
            return await context.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
        }

        public async Task<bool> ExistsAsync(Guid categoryId)
        {
            return await context.Categories.AnyAsync(c => c.Id == categoryId);
        }
    }
}
