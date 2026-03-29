using server.Models.Locations;

namespace server.Types.Repositories
{
	/// <summary>
	/// Defines data access operations for comment locations (file path and line range).
	/// </summary>
	public interface ILocationRepository
	{
		/// <summary>
		/// Persists a new location entity.
		/// </summary>
		Task<Location> CreateAsync(Location location);
	}
}
