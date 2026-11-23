namespace TaskManager.Application.DTOs;

public record UpdateTaskDto(
    string Title,
    string? Description,
    bool IsCompleted,
    int? CategoryId = null
);
