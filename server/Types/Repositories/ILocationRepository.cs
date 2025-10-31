using server.Models.Locations;

namespace server.Types.Repositories
{
	public interface ILocationRepository
	{
		Task<Location> CreateAsync(Location location);
	}
}
