using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace TaskManager.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        string basePath = Directory.GetCurrentDirectory();
        string apiPath = Path.Combine(basePath, "TaskManager.API");
        if (!Directory.Exists(apiPath))
        {
            apiPath = Path.Combine(basePath, "../TaskManager.API");
        }

        IConfigurationRoot configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.Exists(apiPath) ? apiPath : basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        string connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=localhost\\SQLEXPRESS;Database=TaskManagerDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";

        DbContextOptionsBuilder<ApplicationDbContext> optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
