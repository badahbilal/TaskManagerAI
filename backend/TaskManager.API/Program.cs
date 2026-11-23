using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TaskManager.Application;
using TaskManager.Infrastructure;
using TaskManager.Infrastructure.Persistence;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Support cloud container PORT environment variable (Render, Railway, etc.)
string? envPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(envPort))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{envPort}");
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Clean Architecture service registrations
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// CORS configuration for frontend (supports local dev, Vercel, Netlify, and custom domains)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed((string origin) =>
        {
            if (string.IsNullOrWhiteSpace(origin))
            {
                return false;
            }

            Uri originUri = new Uri(origin);
            if (originUri.Host == "localhost" || originUri.Host == "127.0.0.1")
            {
                return true;
            }

            if (originUri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase) ||
                originUri.Host.EndsWith(".netlify.app", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return false;
        })
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

WebApplication app = builder.Build();

// Automatically apply pending database migrations on startup
using (IServiceScope scope = app.Services.CreateScope())
{
    ILogger<Program> logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        logger.LogInformation("Checking and applying pending database migrations...");
        dbContext.Database.Migrate();
        logger.LogInformation("Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while applying database migrations on startup.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();

app.MapControllers();

app.Run();
