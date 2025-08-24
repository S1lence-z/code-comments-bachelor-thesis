namespace server.Models.Locations.DTOs
{
	public abstract class LocationDto
	{
		public Guid Id { get; set; }
		public string Type { get; set; } = string.Empty;
	}
}
