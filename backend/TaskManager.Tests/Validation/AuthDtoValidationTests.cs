using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskManager.Application.DTOs;
using Xunit;

namespace TaskManager.Tests.Validation;

public class AuthDtoValidationTests
{
    private static List<ValidationResult> ValidateModel(object model)
    {
        List<ValidationResult> validationResults = new List<ValidationResult>();
        ValidationContext validationContext = new ValidationContext(model, null, null);
        Validator.TryValidateObject(model, validationContext, validationResults, validateAllProperties: true);
        return validationResults;
    }

    [Fact]
    public void RegisterRequestDto_WhenValid_PassesValidation()
    {
        // Arrange
        RegisterRequestDto dto = new RegisterRequestDto("Alice Smith", "alice@example.com", "SecurePassword123!");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void RegisterRequestDto_WhenFullNameTooShort_FailsValidation()
    {
        // Arrange
        RegisterRequestDto dto = new RegisterRequestDto("A", "alice@example.com", "SecurePassword123!");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.NotEmpty(results);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(RegisterRequestDto.FullName)));
    }

    [Fact]
    public void RegisterRequestDto_WhenEmailInvalid_FailsValidation()
    {
        // Arrange
        RegisterRequestDto dto = new RegisterRequestDto("Alice Smith", "not-an-email", "SecurePassword123!");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.NotEmpty(results);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(RegisterRequestDto.Email)));
    }

    [Fact]
    public void RegisterRequestDto_WhenPasswordTooShort_FailsValidation()
    {
        // Arrange
        RegisterRequestDto dto = new RegisterRequestDto("Alice Smith", "alice@example.com", "123");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.NotEmpty(results);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(RegisterRequestDto.Password)));
    }

    [Fact]
    public void LoginRequestDto_WhenValid_PassesValidation()
    {
        // Arrange
        LoginRequestDto dto = new LoginRequestDto("alice@example.com", "SecurePassword123!");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void LoginRequestDto_WhenEmailInvalid_FailsValidation()
    {
        // Arrange
        LoginRequestDto dto = new LoginRequestDto("not-an-email", "SecurePassword123!");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.NotEmpty(results);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(LoginRequestDto.Email)));
    }

    [Fact]
    public void LoginRequestDto_WhenPasswordTooShort_FailsValidation()
    {
        // Arrange
        LoginRequestDto dto = new LoginRequestDto("alice@example.com", "123");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.NotEmpty(results);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(LoginRequestDto.Password)));
    }
}
