using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
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

    public async Task<List<TaskDto>> GetAllTasksAsync(int userId, CancellationToken cancellationToken = default)
    {
        List<TaskItem> tasks = await _taskRepository.GetAllByUserIdAsync(userId, cancellationToken);
        List<TaskDto> dtos = tasks.Select(MapToDto).ToList();

        return dtos;
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        TaskItem? task = await _taskRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
        if (task == null)
        {
            return null;
        }

        return MapToDto(task);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, int userId, CancellationToken cancellationToken = default)
    {
        TaskItem newTask = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            CategoryId = dto.CategoryId,
            UserId = userId
        };

        TaskItem createdTask = await _taskRepository.AddAsync(newTask, cancellationToken);
        return MapToDto(createdTask);
    }

    public async Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto dto, int userId, CancellationToken cancellationToken = default)
    {
        TaskItem? existingTask = await _taskRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
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

    public async Task<bool> DeleteTaskAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        TaskItem? existingTask = await _taskRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
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
