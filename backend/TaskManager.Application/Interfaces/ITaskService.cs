using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Interfaces;

public interface ITaskService
{
    Task<List<TaskDto>> GetTasksByDateAsync(int userId, DateOnly? date, CancellationToken cancellationToken = default);
    Task<List<TaskDto>> GetUpcomingTasksAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<TaskDto>> GetAllTasksAsync(int userId, CancellationToken cancellationToken = default);
    Task<TaskDto?> GetTaskByIdAsync(int id, int userId, CancellationToken cancellationToken = default);
    Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, int userId, CancellationToken cancellationToken = default);
    Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto dto, int userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteTaskAsync(int id, int userId, CancellationToken cancellationToken = default);
}
