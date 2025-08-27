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
				SinglelineLocation lineLocation => new SinglelineLocationDto
				{
					Id = lineLocation.Id,
					FilePath = lineLocation.FilePath,
					LineNumber = lineLocation.LineNumber
				},
				MultilineLocation lineRange => new MultilineLocationDto
				{
					Id = lineRange.Id,
					FilePath = lineRange.FilePath,
					StartLineNumber = lineRange.StartLineNumber,
					EndLineNumber = lineRange.EndLineNumber
				},
				FileLocation otherLocation => new FileLocationDto
				{
					Id = otherLocation.Id,
					FilePath = otherLocation.FilePath,
					Description = otherLocation.Description
				},
				ProjectLocation projectLocation => new ProjectLocationDto
				{
					Id = projectLocation.Id,
					FilePath = projectLocation.FilePath,
					Description = projectLocation.Description
				},
				_ => throw new ArgumentException("Unknown location type")
			};
		}
	}
}
