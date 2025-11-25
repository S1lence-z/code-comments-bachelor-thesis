namespace server.Models.Auth
{
    public class AuthResponseDto
    {
        public bool Success => !string.IsNullOrEmpty(Token);
        public string Message { get; set; } = string.Empty;
		public string? Token { get; set; } = string.Empty;
    }
}
