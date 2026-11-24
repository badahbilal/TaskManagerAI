using System;

namespace TaskManager.Application.DTOs;

public record TaskDto(
    int Id,
    string Title,
    string? Description,
    bool IsCompleted,
    DateTime CreatedAt,
    DateOnly DueDate,
    bool IsDaily,
    DateTime? CompletedAt,
    int? CategoryId,
    CategoryDto? Category
);
