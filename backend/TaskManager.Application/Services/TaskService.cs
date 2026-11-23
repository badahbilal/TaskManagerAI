using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;

    public TaskService(ITaskRepository taskRepository)
    {
        _taskRepository = taskRepository;
    }

    public async Task<List<TaskDto>> GetAllTasksAsync(CancellationToken cancellationToken = default)
    {
        List<TaskItem> tasks = await _taskRepository.GetAllAsync(cancellationToken);
        List<TaskDto> dtos = tasks.Select(MapToDto).ToList();

        return dtos;
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        TaskItem? task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            return null;
        }

        return MapToDto(task);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, CancellationToken cancellationToken = default)
    {
        TaskItem newTask = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            CategoryId = dto.CategoryId
        };

        TaskItem createdTask = await _taskRepository.AddAsync(newTask, cancellationToken);
        return MapToDto(createdTask);
    }

    public async Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto dto, CancellationToken cancellationToken = default)
    {
        TaskItem? existingTask = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (existingTask == null)
        {
            return null;
        }

        existingTask.Title = dto.Title;
        existingTask.Description = dto.Description;
        existingTask.IsCompleted = dto.IsCompleted;
        existingTask.CategoryId = dto.CategoryId;

        await _taskRepository.UpdateAsync(existingTask, cancellationToken);
        return MapToDto(existingTask);
    }

    public async Task<bool> DeleteTaskAsync(int id, CancellationToken cancellationToken = default)
    {
        TaskItem? existingTask = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (existingTask == null)
        {
            return false;
        }

        await _taskRepository.DeleteAsync(existingTask, cancellationToken);
        return true;
    }

    private static TaskDto MapToDto(TaskItem task)
    {
        CategoryDto? categoryDto = task.Category != null
            ? new CategoryDto(task.Category.Id, task.Category.Name, task.Category.Color)
            : null;

        return new TaskDto(
            task.Id,
            task.Title,
            task.Description,
            task.IsCompleted,
            task.CreatedAt,
            task.CategoryId,
            categoryDto
        );
    }
}
