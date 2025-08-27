using System.Text.Json.Serialization;

namespace server.Models.Locations.DTOs
{
	[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
	[JsonDerivedType(typeof(SinglelineLocationDto), "Singleline")]
	[JsonDerivedType(typeof(MultilineLocationDto), "Multiline")]
	[JsonDerivedType(typeof(FileLocationDto), "File")]
	[JsonDerivedType(typeof(ProjectLocationDto), "Project")]
	public abstract class LocationDto
	{
		public Guid Id { get; set; }
		public string FilePath { get; set; } = string.Empty;
	}
}
