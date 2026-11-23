using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Application.Interfaces;
using TaskManager.Infrastructure.Persistence;
using TaskManager.Infrastructure.Repositories;

namespace TaskManager.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        string rawConnectionString = configuration.GetConnectionString("DefaultConnection")
            ?? Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? "Host=localhost;Port=5432;Database=TaskManagerDb;Username=postgres;Password=postgres";

        string connectionString = ParseConnectionString(rawConnectionString);

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();

        return services;
    }

    private static string ParseConnectionString(string input)
    {
        if (input.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            input.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            Uri uri = new Uri(input);
            string[] userInfo = uri.UserInfo.Split(':');
            string username = userInfo[0];
            string password = userInfo.Length > 1 ? userInfo[1] : string.Empty;
            int port = uri.Port > 0 ? uri.Port : 5432;
            string database = uri.AbsolutePath.TrimStart('/');

            return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
        }

        return input;
    }
}
