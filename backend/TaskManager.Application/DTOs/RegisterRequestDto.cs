using System.ComponentModel.DataAnnotations;

namespace TaskManager.Application.DTOs;

public record RegisterRequestDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; init; } = string.Empty;

    public RegisterRequestDto()
    {
    }

    public RegisterRequestDto(string fullName, string email, string password)
    {
        FullName = fullName;
        Email = email;
        Password = password;
    }
}
