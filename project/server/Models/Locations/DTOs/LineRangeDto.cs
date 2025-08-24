namespace server.Models.Locations.DTOs
{
	public class LineRangeDto : LocationDto
	{
		public int StartLineNumber { get; set; }
		public int EndLineNumber { get; set; }
	}
}
