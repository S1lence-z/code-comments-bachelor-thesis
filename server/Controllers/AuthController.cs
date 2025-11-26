using Microsoft.AspNetCore.Mvc;
using server.Types.Interfaces;
using server.Models.Auth;

namespace server.Controllers
{
    [Route("api/v1/auth")]
    [ApiController]
	public class AuthController(IAuthService authService) : ControllerBase
    {
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
