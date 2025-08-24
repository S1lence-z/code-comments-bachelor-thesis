using server.Models.Locations;
using server.Models.Locations.DTOs;

namespace server.Mappers
{
	public static class LocationMapper
	{
		public static LocationDto ToDto(Location location)
		{
			return location switch
			{
				LineLocation lineLocation => new LineLocationDto
				{
					Id = lineLocation.Id,
					Type = nameof(LineLocation),
					LineNumber = lineLocation.LineNumber
				},
				LineRange lineRange => new LineRangeDto
				{
					Id = lineRange.Id,
					Type = nameof(LineRange),
					StartLineNumber = lineRange.StartLineNumber,
					EndLineNumber = lineRange.EndLineNumber
				},
				OtherLocation otherLocation => new OtherLocationDto
				{
					Id = otherLocation.Id,
					Type = nameof(OtherLocation),
					Description = otherLocation.Description
				},
				_ => throw new ArgumentException("Unknown location type")
			};
		}
	}
}
