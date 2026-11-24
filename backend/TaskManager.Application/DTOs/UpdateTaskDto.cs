using System;
using System.ComponentModel.DataAnnotations;

namespace TaskManager.Application.DTOs;

public record UpdateTaskDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; init; } = string.Empty;

    public string? Description { get; init; }

    public bool IsCompleted { get; init; }

    public int? CategoryId { get; init; }

    public DateOnly? DueDate { get; init; }

    public bool IsDaily { get; init; } = false;

    public UpdateTaskDto()
    {
    }

    public UpdateTaskDto(string title, string? description = null, bool isCompleted = false, int? categoryId = null, DateOnly? dueDate = null, bool isDaily = false)
    {
        Title = title;
        Description = description;
        IsCompleted = isCompleted;
        CategoryId = categoryId;
        DueDate = dueDate;
        IsDaily = isDaily;
    }
}
