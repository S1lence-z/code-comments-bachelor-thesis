using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.Data;
using server.Data.Repositories;
using server.Middleware;
using server.Services;
using server.Types.Interfaces;
using server.Types.Repositories;
using System.Text.Json.Serialization;

namespace server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Read appsettings.*.json (environment variables)
            builder.Services.Configure<ApiUrls>(builder.Configuration.GetSection("ApiUrls"));

            // Add db context
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(builder.Configuration.GetConnectionString("localDb"))
            );

            // Register repositories
            builder.Services.AddScoped<ICommentRepository, CommentRepository>();
            builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
            builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();

            // Register services
            builder.Services.AddScoped<IProjectService, ProjectService>();
            builder.Services.AddScoped<ICategoryService, CategoryService>();
            builder.Services.AddScoped<ICommentService, CommentService>();

            // Add services to the container.
            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Automatically apply migrations
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                context.Database.Migrate();
            }

            // Middleware
            app.UseMiddleware<ExceptionHandlingMiddleware>();
            EnableCors(app);
            app.UseSwagger();
            app.UseSwaggerUI();


            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }

        private static void EnableCors(IApplicationBuilder app)
        {
            app.UseCors(builder =>
            {
                builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        }
    }
}
