using System.ComponentModel.DataAnnotations;

namespace TaskManager.Application.DTOs;

public record CreateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; init; } = string.Empty;

    [StringLength(20)]
    public string? Color { get; init; }

    public CreateCategoryDto()
    {
    }

    public CreateCategoryDto(string name, string? color)
    {
        Name = name;
        Color = color;
    }
}
