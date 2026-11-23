using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Application.Services;
using TaskManager.Domain.Entities;
using Xunit;

namespace TaskManager.Tests.Services;

public class CategoryServiceTests
{
    private readonly Mock<ICategoryRepository> _repositoryMock;
    private readonly CategoryService _categoryService;

    public CategoryServiceTests()
    {
        _repositoryMock = new Mock<ICategoryRepository>();
        _categoryService = new CategoryService(_repositoryMock.Object);
    }

    [Fact]
    public async Task GetAllCategoriesAsync_WhenCategoriesExist_ReturnsMappedDtos()
    {
        // Arrange
        List<Category> mockCategories = new List<Category>
        {
            new Category { Id = 1, Name = "Work", Color = "#6366f1" },
            new Category { Id = 2, Name = "Personal", Color = "#10b981" }
        };

        _repositoryMock
            .Setup(repo => repo.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCategories);

        // Act
        List<CategoryDto> result = await _categoryService.GetAllCategoriesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Equal(1, result[0].Id);
        Assert.Equal("Work", result[0].Name);
        Assert.Equal("#6366f1", result[0].Color);
        Assert.Equal(2, result[1].Id);
        Assert.Equal("Personal", result[1].Name);
        Assert.Equal("#10b981", result[1].Color);
        _repositoryMock.Verify(repo => repo.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllCategoriesAsync_WhenNoCategoriesExist_ReturnsEmptyList()
    {
        // Arrange
        _repositoryMock
            .Setup(repo => repo.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Category>());

        // Act
        List<CategoryDto> result = await _categoryService.GetAllCategoriesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
        _repositoryMock.Verify(repo => repo.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetCategoryByIdAsync_WhenCategoryFound_ReturnsCategoryDto()
    {
        // Arrange
        int categoryId = 5;
        Category mockCategory = new Category { Id = categoryId, Name = "Finance", Color = "#f59e0b" };

        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCategory);

        // Act
        CategoryDto? result = await _categoryService.GetCategoryByIdAsync(categoryId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(categoryId, result.Id);
        Assert.Equal("Finance", result.Name);
        Assert.Equal("#f59e0b", result.Color);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetCategoryByIdAsync_WhenCategoryNotFound_ReturnsNull()
    {
        // Arrange
        int categoryId = 999;
        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category?)null);

        // Act
        CategoryDto? result = await _categoryService.GetCategoryByIdAsync(categoryId);

        // Assert
        Assert.Null(result);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateCategoryAsync_ValidDto_CreatesAndReturnsDto()
    {
        // Arrange
        CreateCategoryDto createDto = new CreateCategoryDto("Health", "#ef4444");
        Category persistedCategory = new Category { Id = 1, Name = "Health", Color = "#ef4444" };

        _repositoryMock
            .Setup(repo => repo.AddAsync(It.IsAny<Category>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(persistedCategory);

        // Act
        CategoryDto result = await _categoryService.CreateCategoryAsync(createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("Health", result.Name);
        Assert.Equal("#ef4444", result.Color);
        _repositoryMock.Verify(repo => repo.AddAsync(
            It.Is<Category>(c => c.Name == "Health" && c.Color == "#ef4444"),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateCategoryAsync_WhenCategoryFound_UpdatesAndReturnsDto()
    {
        // Arrange
        int categoryId = 4;
        UpdateCategoryDto updateDto = new UpdateCategoryDto("Fitness", "#10b981");
        Category existingCategory = new Category { Id = categoryId, Name = "Health", Color = "#ef4444" };

        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCategory);

        _repositoryMock
            .Setup(repo => repo.UpdateAsync(existingCategory, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        CategoryDto? result = await _categoryService.UpdateCategoryAsync(categoryId, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(categoryId, result.Id);
        Assert.Equal("Fitness", result.Name);
        Assert.Equal("#10b981", result.Color);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.UpdateAsync(existingCategory, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateCategoryAsync_WhenCategoryNotFound_ReturnsNull()
    {
        // Arrange
        int categoryId = 999;
        UpdateCategoryDto updateDto = new UpdateCategoryDto("Fitness", "#10b981");

        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category?)null);

        // Act
        CategoryDto? result = await _categoryService.UpdateCategoryAsync(categoryId, updateDto);

        // Assert
        Assert.Null(result);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<Category>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteCategoryAsync_WhenCategoryFound_DeletesAndReturnsTrue()
    {
        // Arrange
        int categoryId = 2;
        Category existingCategory = new Category { Id = categoryId, Name = "To Delete", Color = null };

        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCategory);

        _repositoryMock
            .Setup(repo => repo.DeleteAsync(existingCategory, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        bool result = await _categoryService.DeleteCategoryAsync(categoryId);

        // Assert
        Assert.True(result);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.DeleteAsync(existingCategory, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteCategoryAsync_WhenCategoryNotFound_ReturnsFalse()
    {
        // Arrange
        int categoryId = 999;
        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category?)null);

        // Act
        bool result = await _categoryService.DeleteCategoryAsync(categoryId);

        // Assert
        Assert.False(result);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(categoryId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.DeleteAsync(It.IsAny<Category>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
