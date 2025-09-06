namespace server.Models.Locations
{
	public class MultilineLocation : Location
	{
		public int StartLineNumber { get; set; }
		public int EndLineNumber { get; set; }
	}
}
