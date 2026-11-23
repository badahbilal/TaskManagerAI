using System.ComponentModel.DataAnnotations;

namespace TaskManager.Application.DTOs;

public record CreateCategoryDto(
    [property: Required]
    [property: StringLength(100, MinimumLength = 1)]
    string Name,

    [property: StringLength(20)]
    string? Color
);
