using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
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

    public async Task<List<TaskItem>> GetAllByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        List<TaskItem> tasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId)
            .Include(t => t.Category)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return tasks;
    }

    public async Task<List<TaskItem>> GetAllByUserIdAndDateAsync(int userId, DateOnly date, CancellationToken cancellationToken = default)
    {
        List<TaskItem> tasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId && t.DueDate == date)
            .Include(t => t.Category)
            .OrderBy(t => t.IsCompleted)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return tasks;
    }

    public async Task<List<TaskItem>> GetUpcomingByUserIdAsync(int userId, DateOnly today, CancellationToken cancellationToken = default)
    {
        List<TaskItem> tasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId && t.DueDate > today)
            .Include(t => t.Category)
            .OrderBy(t => t.DueDate)
            .ThenBy(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return tasks;
    }

    public async Task<List<TaskItem>> GetPastDailyTemplatesAsync(int userId, DateOnly today, CancellationToken cancellationToken = default)
    {
        List<TaskItem> tasks = await _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId && t.IsDaily && t.DueDate < today)
            .Include(t => t.Category)
            .ToListAsync(cancellationToken);

        return tasks;
    }

    public async Task<TaskItem?> GetByIdAndUserIdAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        TaskItem? task = await _context.Tasks
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, cancellationToken);

        return task;
    }

    public async Task<TaskItem> AddAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        await _context.Tasks.AddAsync(task, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        if (task.CategoryId.HasValue)
        {
            await _context.Entry(task).Reference(t => t.Category).LoadAsync(cancellationToken);
        }

        return task;
    }

    public async Task AddRangeAsync(IEnumerable<TaskItem> tasks, CancellationToken cancellationToken = default)
    {
        await _context.Tasks.AddRangeAsync(tasks, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync(cancellationToken);

        if (task.CategoryId.HasValue)
        {
            await _context.Entry(task).Reference(t => t.Category).LoadAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
