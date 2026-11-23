using TaskManager.Application.DTOs;

namespace TaskManager.Application.Interfaces;

public interface ITaskService
{
    Task<List<TaskDto>> GetAllTasksAsync(CancellationToken cancellationToken = default);
    Task<TaskDto?> GetTaskByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, CancellationToken cancellationToken = default);
    Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteTaskAsync(int id, CancellationToken cancellationToken = default);
}
