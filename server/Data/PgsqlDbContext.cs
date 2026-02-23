using Microsoft.EntityFrameworkCore;

namespace server.Data
{
	public class PgsqlDbContext : ApplicationDbContext
	{
		public PgsqlDbContext(DbContextOptions<PgsqlDbContext> options) : base(options) { }
	}
}
