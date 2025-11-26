using server.Models.Auth;

namespace server.Types.Interfaces
{
    public interface IAuthService
    {
        AuthResponseDto Authenticate(LoginRequestDto loginRequest);
    }
}
