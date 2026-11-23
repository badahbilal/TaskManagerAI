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
        List<TaskDto> dtos = tasks.Select(t => new TaskDto(
            t.Id,
            t.Title,
            t.Description,
            t.IsCompleted,
            t.CreatedAt
        )).ToList();

        return dtos;
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        TaskItem? task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            return null;
        }

        return new TaskDto(task.Id, task.Title, task.Description, task.IsCompleted, task.CreatedAt);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, CancellationToken cancellationToken = default)
    {
        TaskItem newTask = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        TaskItem createdTask = await _taskRepository.AddAsync(newTask, cancellationToken);
        return new TaskDto(
            createdTask.Id,
            createdTask.Title,
            createdTask.Description,
            createdTask.IsCompleted,
            createdTask.CreatedAt
        );
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

        await _taskRepository.UpdateAsync(existingTask, cancellationToken);
        return new TaskDto(
            existingTask.Id,
            existingTask.Title,
            existingTask.Description,
            existingTask.IsCompleted,
            existingTask.CreatedAt
        );
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
}
