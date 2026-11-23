using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskManager.Application.DTOs;
using Xunit;

namespace TaskManager.Tests.Validation;

public class CategoryDtoValidationTests
{
    private static List<ValidationResult> ValidateModel(object model)
    {
        List<ValidationResult> validationResults = new List<ValidationResult>();
        ValidationContext validationContext = new ValidationContext(model, null, null);
        Validator.TryValidateObject(model, validationContext, validationResults, validateAllProperties: true);
        return validationResults;
    }

    [Fact]
    public void CreateCategoryDto_WhenValid_PassesValidation()
    {
        // Arrange
        CreateCategoryDto dto = new CreateCategoryDto("Work", "#6366f1");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void CreateCategoryDto_WhenNameIsNull_FailsValidation()
    {
        // Arrange
        CreateCategoryDto dto = new CreateCategoryDto(null!, "#6366f1");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.NotEmpty(results);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CreateCategoryDto.Name)));
    }

    [Fact]
    public void CreateCategoryDto_WhenNameIsEmpty_FailsValidation()
    {
        // Arrange
        CreateCategoryDto dto = new CreateCategoryDto(string.Empty, "#6366f1");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.NotEmpty(results);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CreateCategoryDto.Name)));
    }

    [Fact]
    public void CreateCategoryDto_WhenNameExceeds100Characters_FailsValidation()
    {
        // Arrange
        string longName = new string('A', 101);
        CreateCategoryDto dto = new CreateCategoryDto(longName, "#6366f1");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.NotEmpty(results);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CreateCategoryDto.Name)));
    }

    [Fact]
    public void CreateCategoryDto_WhenColorExceeds20Characters_FailsValidation()
    {
        // Arrange
        string longColor = new string('B', 21);
        CreateCategoryDto dto = new CreateCategoryDto("Work", longColor);

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.NotEmpty(results);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CreateCategoryDto.Color)));
    }

    [Fact]
    public void UpdateCategoryDto_WhenValid_PassesValidation()
    {
        // Arrange
        UpdateCategoryDto dto = new UpdateCategoryDto("Personal", "#10b981");

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void UpdateCategoryDto_WhenNameIsEmpty_FailsValidation()
    {
        // Arrange
        UpdateCategoryDto dto = new UpdateCategoryDto(string.Empty, null);

        // Act
        List<ValidationResult> results = ValidateModel(dto);

        // Assert
        Assert.NotEmpty(results);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(UpdateCategoryDto.Name)));
    }
}
