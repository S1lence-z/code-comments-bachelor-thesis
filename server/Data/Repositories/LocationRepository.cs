using Microsoft.EntityFrameworkCore;
using server.Models.Locations;
using server.Types.Repositories;

namespace server.Data.Repositories
{
	public class LocationRepository(ApplicationDbContext context) : ILocationRepository
	{
		public async Task<Location> CreateAsync(Location location)
		{
			await context.Locations.AddAsync(location);
			await context.SaveChangesAsync();

			var created = await context.Locations
				.AsNoTracking()
				.FirstAsync(l => l.Id == location.Id);
			return created;
		}
	}
}
