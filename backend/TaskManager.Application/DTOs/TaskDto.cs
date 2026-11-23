namespace TaskManager.Application.DTOs;

public record TaskDto(
    int Id,
    string Title,
    string? Description,
    bool IsCompleted,
    DateTime CreatedAt,
    int? CategoryId,
    CategoryDto? Category
);
