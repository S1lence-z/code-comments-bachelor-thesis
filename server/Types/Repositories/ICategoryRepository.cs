using server.Models.Categories;

namespace server.Types.Repositories
{
    /// <summary>
    /// Defines data access operations for comment categories.
    /// </summary>
    public interface ICategoryRepository
    {
        /// <summary>
        /// Returns all categories.
        /// </summary>
        Task<IEnumerable<Category>> GetAllAsync();

        /// <summary>
        /// Returns a category by its ID, or null if not found.
        /// </summary>
        Task<Category?> GetByIdAsync(Guid? categoryId);

        /// <summary>
        /// Checks whether a category with the given ID exists.
        /// </summary>
        Task<bool> ExistsAsync(Guid categoryId);
    }
}
