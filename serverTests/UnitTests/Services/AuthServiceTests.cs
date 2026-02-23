using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using Moq;
using server.Configs;
using server.Models.Auth;
using server.Services;

namespace serverTests.UnitTests.Services
{
    public class AuthServiceTests
    {
        private readonly JwtSettings _jwtSettings;
        private readonly AuthService _sut;

        public AuthServiceTests()
        {
            _jwtSettings = new JwtSettings
            {
                SecretKey = "ThisIsASecretKeyForTestingPurposesOnly1234567890",
                Issuer = "TestIssuer",
                Audience = "TestAudience",
                ExpirationMinutes = 30,
                ProjectPassword = "correctPassword"
            };

            var optionsMock = new Mock<IOptions<JwtSettings>>();
            optionsMock.Setup(o => o.Value).Returns(_jwtSettings);

            _sut = new AuthService(optionsMock.Object);
        }

        [Fact]
        public void Authenticate_ValidPassword_ReturnsSuccessWithToken()
        {
            // Arrange
            var request = new LoginRequestDto { Password = "correctPassword" };

            // Act
            var result = _sut.Authenticate(request);

            // Assert
            Assert.True(result.Success);
            Assert.NotNull(result.Token);
            Assert.Equal("Authentication Successful", result.Message);
        }

        [Fact]
        public void Authenticate_InvalidPassword_ReturnsFailureWithNullToken()
        {
            // Arrange
            var request = new LoginRequestDto { Password = "wrongPassword" };

            // Act
            var result = _sut.Authenticate(request);

            // Assert
            Assert.False(result.Success);
            Assert.Null(result.Token);
            Assert.Equal("Invalid Password", result.Message);
        }

        [Fact]
        public void Authenticate_ValidPassword_TokenContainsAdminRoleClaim()
        {
            // Arrange
            var request = new LoginRequestDto { Password = "correctPassword" };

            // Act
            var result = _sut.Authenticate(request);

            // Assert
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(result.Token);

            var roleClaim = token.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");
            Assert.NotNull(roleClaim);
            Assert.Equal("Admin", roleClaim.Value);
        }

        [Fact]
        public void Authenticate_ValidPassword_TokenContainsCorrectIssuer()
        {
            // Arrange
            var request = new LoginRequestDto { Password = "correctPassword" };

            // Act
            var result = _sut.Authenticate(request);

            // Assert
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(result.Token);

            Assert.Equal("TestIssuer", token.Issuer);
        }

        [Fact]
        public void Authenticate_ValidPassword_TokenExpiresAtConfiguredTime()
        {
            // Arrange
            var request = new LoginRequestDto { Password = "correctPassword" };
            var beforeAuth = DateTime.UtcNow;

            // Act
            var result = _sut.Authenticate(request);

            // Assert
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(result.Token);

            var expectedExpiry = beforeAuth.AddMinutes(_jwtSettings.ExpirationMinutes);
            // Allow 5 seconds tolerance for test execution time
            Assert.InRange(token.ValidTo, expectedExpiry.AddSeconds(-5), expectedExpiry.AddSeconds(5));
        }

        [Fact]
        public void Authenticate_EmptyPassword_ReturnsFailure()
        {
            // Arrange
            var request = new LoginRequestDto { Password = "" };

            // Act
            var result = _sut.Authenticate(request);

            // Assert
            Assert.False(result.Success);
            Assert.Null(result.Token);
        }
    }
}
