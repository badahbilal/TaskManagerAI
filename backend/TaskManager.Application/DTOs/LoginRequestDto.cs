using System.ComponentModel.DataAnnotations;

namespace TaskManager.Application.DTOs;

public record LoginRequestDto
{
    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; init; } = string.Empty;

    public LoginRequestDto()
    {
    }

    public LoginRequestDto(string email, string password)
    {
        Email = email;
        Password = password;
    }
}
