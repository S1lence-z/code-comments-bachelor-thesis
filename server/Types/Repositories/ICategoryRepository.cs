using server.Models.Categories;

namespace server.Types.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync();
        Task<Category?> GetByIdAsync(Guid? categoryId);
        Task<bool> ExistsAsync(Guid categoryId);
    }
}
