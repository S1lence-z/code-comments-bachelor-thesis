using Microsoft.AspNetCore.Mvc;
using server.Types.Interfaces;
using server.Models.Auth;

namespace server.Controllers
{
    [Route("api/v1/auth")]
    [ApiController]
	/// <summary>
	/// Handles user authentication and token generation.
	/// </summary>
	public class AuthController(IAuthService authService) : ControllerBase
    {
        /// <summary>
        /// Authenticates a user with the provided credentials and returns a JWT token.
        /// </summary>
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequestDto request)
        {
            AuthResponseDto authResponse = authService.Authenticate(request);
            if (!authResponse.Success)
            {
                return Unauthorized(authResponse);
			}
            return Ok(authResponse);
		}
	}
}
