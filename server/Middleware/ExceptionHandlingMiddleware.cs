using System.Net;
using System.Text.Json;

namespace server.Middleware
{
	public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
	{
		private readonly RequestDelegate _next = next;
		private readonly ILogger<ExceptionHandlingMiddleware> _logger = logger;

		public async Task InvokeAsync(HttpContext context)
		{
			try
			{
				await _next(context);
			}
			catch (Exception ex)
			{
				await HandleExceptionAsync(context, ex);
			}
		}

		private async Task HandleExceptionAsync(HttpContext context, Exception exception)
		{
			_logger.LogError(exception, "An unhandled exception occurred");

			context.Response.ContentType = "application/json";

			var (statusCode, message) = exception switch
			{
				ArgumentException or InvalidOperationException => (HttpStatusCode.BadRequest, exception.Message),
				KeyNotFoundException => (HttpStatusCode.NotFound, exception.Message),
				_ => (HttpStatusCode.InternalServerError, exception.Message)
			};

			context.Response.StatusCode = (int)statusCode;

			var response = new
			{
				message,
				statusCode = (int)statusCode
			};

			string jsonResponse = JsonSerializer.Serialize(response);
			await context.Response.WriteAsync(jsonResponse);
		}
	}
}
