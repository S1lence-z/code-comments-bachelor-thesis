namespace server.Models.Locations
{
	public abstract class Location
	{
		public Guid Id { get; set; }
		public string FilePath { get; set; } = string.Empty;
	}
}
