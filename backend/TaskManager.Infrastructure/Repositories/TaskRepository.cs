using Microsoft.EntityFrameworkCore;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Persistence;

namespace TaskManager.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly ApplicationDbContext _context;

    public TaskRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        List<TaskItem> tasks = await _context.Tasks
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return tasks;
    }

    public async Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        TaskItem? task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        return task;
    }

    public async Task<TaskItem> AddAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        await _context.Tasks.AddAsync(task, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return task;
    }

    public async Task UpdateAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
