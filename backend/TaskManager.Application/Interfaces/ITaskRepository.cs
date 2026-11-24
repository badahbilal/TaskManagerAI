using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Interfaces;

public interface ITaskRepository
{
    Task<List<TaskItem>> GetAllByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> GetAllByUserIdAndDateAsync(int userId, DateOnly date, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> GetUpcomingByUserIdAsync(int userId, DateOnly today, CancellationToken cancellationToken = default);
    Task<List<TaskItem>> GetPastDailyTemplatesAsync(int userId, DateOnly today, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetByIdAndUserIdAsync(int id, int userId, CancellationToken cancellationToken = default);
    Task<TaskItem> AddAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<TaskItem> tasks, CancellationToken cancellationToken = default);
    Task UpdateAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task DeleteAsync(TaskItem task, CancellationToken cancellationToken = default);
}
