using System.ComponentModel.DataAnnotations;

namespace TaskManager.Application.DTOs;

public record UpdateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; init; } = string.Empty;

    [StringLength(20)]
    public string? Color { get; init; }

    public UpdateCategoryDto()
    {
    }

    public UpdateCategoryDto(string name, string? color)
    {
        Name = name;
        Color = color;
    }
}
