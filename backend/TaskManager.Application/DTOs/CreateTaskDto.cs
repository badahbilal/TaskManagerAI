using System;
using System.ComponentModel.DataAnnotations;

namespace TaskManager.Application.DTOs;

public record CreateTaskDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; init; } = string.Empty;

    public string? Description { get; init; }

    public int? CategoryId { get; init; }

    public DateOnly? DueDate { get; init; }

    public bool IsDaily { get; init; } = false;

    public CreateTaskDto()
    {
    }

    public CreateTaskDto(string title, string? description = null, int? categoryId = null, DateOnly? dueDate = null, bool isDaily = false)
    {
        Title = title;
        Description = description;
        CategoryId = categoryId;
        DueDate = dueDate;
        IsDaily = isDaily;
    }
}
