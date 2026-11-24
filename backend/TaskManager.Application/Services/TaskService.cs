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

    public async Task<List<TaskDto>> GetTasksByDateAsync(int userId, DateOnly? date, CancellationToken cancellationToken = default)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        DateOnly targetDate = date ?? today;

        if (targetDate == today)
        {
            await SyncDailyRecurringTasksAsync(userId, today, cancellationToken);
        }

        List<TaskItem> tasks = await _taskRepository.GetAllByUserIdAndDateAsync(userId, targetDate, cancellationToken);
        List<TaskDto> dtos = tasks.Select(MapToDto).ToList();
        return dtos;
    }

    public async Task<List<TaskDto>> GetUpcomingTasksAsync(int userId, CancellationToken cancellationToken = default)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        List<TaskItem> tasks = await _taskRepository.GetUpcomingByUserIdAsync(userId, today, cancellationToken);
        List<TaskDto> dtos = tasks.Select(MapToDto).ToList();
        return dtos;
    }

    public async Task<List<TaskDto>> GetAllTasksAsync(int userId, CancellationToken cancellationToken = default)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        return await GetTasksByDateAsync(userId, today, cancellationToken);
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
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        DateOnly targetDueDate = dto.DueDate ?? today;

        if (targetDueDate < today)
        {
            throw new InvalidOperationException("Cannot create tasks in the past.");
        }

        TaskItem newTask = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            DueDate = targetDueDate,
            IsDaily = dto.IsDaily,
            CompletedAt = null,
            CategoryId = dto.CategoryId,
            UserId = userId
        };

        TaskItem createdTask = await _taskRepository.AddAsync(newTask, cancellationToken);
        return MapToDto(createdTask);
    }

    public async Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto dto, int userId, CancellationToken cancellationToken = default)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        TaskItem? existingTask = await _taskRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
        if (existingTask == null)
        {
            return null;
        }

        if (existingTask.DueDate < today)
        {
            throw new InvalidOperationException("Past tasks are archived and cannot be modified.");
        }

        DateOnly targetDueDate = dto.DueDate ?? existingTask.DueDate;
        if (targetDueDate < today)
        {
            throw new InvalidOperationException("Cannot move tasks to the past.");
        }

        if (targetDueDate > today && dto.IsCompleted)
        {
            throw new InvalidOperationException("Future tasks cannot be marked as completed before their due date.");
        }

        existingTask.Title = dto.Title;
        existingTask.Description = dto.Description;
        existingTask.CategoryId = dto.CategoryId;
        existingTask.DueDate = targetDueDate;
        existingTask.IsDaily = dto.IsDaily;

        if (existingTask.DueDate == today)
        {
            if (dto.IsCompleted && !existingTask.IsCompleted)
            {
                existingTask.IsCompleted = true;
                existingTask.CompletedAt = DateTime.UtcNow;
            }
            else if (!dto.IsCompleted && existingTask.IsCompleted)
            {
                existingTask.IsCompleted = false;
                existingTask.CompletedAt = null;
            }
        }
        else
        {
            existingTask.IsCompleted = false;
            existingTask.CompletedAt = null;
        }

        await _taskRepository.UpdateAsync(existingTask, cancellationToken);
        return MapToDto(existingTask);
    }

    public async Task<bool> DeleteTaskAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        TaskItem? existingTask = await _taskRepository.GetByIdAndUserIdAsync(id, userId, cancellationToken);
        if (existingTask == null)
        {
            return false;
        }

        if (existingTask.DueDate < today)
        {
            throw new InvalidOperationException("Past tasks are archived and cannot be deleted.");
        }

        await _taskRepository.DeleteAsync(existingTask, cancellationToken);
        return true;
    }

    private async Task SyncDailyRecurringTasksAsync(int userId, DateOnly today, CancellationToken cancellationToken)
    {
        List<TaskItem> pastDailyTemplates = await _taskRepository.GetPastDailyTemplatesAsync(userId, today, cancellationToken);
        if (pastDailyTemplates.Count == 0)
        {
            return;
        }

        List<TaskItem> todayTasks = await _taskRepository.GetAllByUserIdAndDateAsync(userId, today, cancellationToken);
        HashSet<string> existingTodayDailyTitles = new HashSet<string>(
            todayTasks.Where(t => t.IsDaily).Select(t => t.Title.Trim()),
            StringComparer.OrdinalIgnoreCase);

        List<TaskItem> newTasksToCreate = new List<TaskItem>();
        HashSet<string> processedTitles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (TaskItem template in pastDailyTemplates)
        {
            string trimmedTitle = template.Title.Trim();
            if (!existingTodayDailyTitles.Contains(trimmedTitle) && !processedTitles.Contains(trimmedTitle))
            {
                processedTitles.Add(trimmedTitle);
                TaskItem todayInstance = new TaskItem
                {
                    Title = template.Title,
                    Description = template.Description,
                    CategoryId = template.CategoryId,
                    DueDate = today,
                    IsDaily = true,
                    IsCompleted = false,
                    CompletedAt = null,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                newTasksToCreate.Add(todayInstance);
            }
        }

        if (newTasksToCreate.Count > 0)
        {
            await _taskRepository.AddRangeAsync(newTasksToCreate, cancellationToken);
        }
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
            task.DueDate,
            task.IsDaily,
            task.CompletedAt,
            task.CategoryId,
            categoryDto
        );
    }
}
