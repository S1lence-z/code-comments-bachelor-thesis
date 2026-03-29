using server.Models.Auth;

namespace server.Types.Interfaces
{
    /// <summary>
    /// Defines the contract for authenticating users and generating auth tokens.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Validates the provided credentials and returns an authentication result with a token on success.
        /// </summary>
        AuthResponseDto Authenticate(LoginRequestDto loginRequest);
    }
}
