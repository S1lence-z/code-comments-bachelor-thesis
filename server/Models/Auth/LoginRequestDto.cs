using System.ComponentModel.DataAnnotations;

namespace server.Models.Auth
{
    public class LoginRequestDto
    {
		[Required]
		public string Password { get; set; } = string.Empty;
	}
}
