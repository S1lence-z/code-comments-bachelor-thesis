using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using server.Configs;
using server.Models.Auth;
using server.Types.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace server.Services
{
    public class AuthService(IOptions<JwtSettings> jwtConfig) : IAuthService
    {
        public AuthResponseDto Authenticate(LoginRequestDto loginRequest)
        {
            // Validate password
            string configuredPassword = jwtConfig.Value.ProjectPassword;
            string password = loginRequest.Password;
			if (password != configuredPassword)
            {
                return new() { Token = null, Message = "Invalid Password" };
			}

            // Create claims
            var claims = new[]
            {
                new Claim(ClaimTypes.Role, "Admin"),
                new Claim("projectId", "default")
			};

			// Generate JWT token
			SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(jwtConfig.Value.SecretKey));
            SigningCredentials creds = new(key, SecurityAlgorithms.HmacSha256);

            JwtSecurityToken token = new(
                issuer: jwtConfig.Value.Issuer,
                audience: jwtConfig.Value.Audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(jwtConfig.Value.ExpirationMinutes),
                signingCredentials: creds
            );
            return new()
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Message = "Authentication Successful"
			};
		}
	}
}
