using Microsoft.EntityFrameworkCore;

namespace server.Data
{
	public class SqliteDbContext : ApplicationDbContext
	{
		public SqliteDbContext(DbContextOptions<SqliteDbContext> options) : base(options) { }
	}
}
