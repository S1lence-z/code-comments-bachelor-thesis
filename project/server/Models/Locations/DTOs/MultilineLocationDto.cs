namespace server.Models.Locations.DTOs
{
	public class MultilineLocationDto : LocationDto
	{
		public int StartLineNumber { get; set; }
		public int EndLineNumber { get; set; }
	}
}
