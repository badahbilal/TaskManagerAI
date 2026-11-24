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

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _repositoryMock;
    private readonly TaskService _taskService;
    private const int TestUserId = 1;

    public TaskServiceTests()
    {
        _repositoryMock = new Mock<ITaskRepository>();
        _taskService = new TaskService(_repositoryMock.Object);
    }

    [Fact]
    public async Task GetAllTasksAsync_WhenTasksExist_ReturnsMappedDtos()
    {
        // Arrange
        Category sampleCategory = new Category { Id = 1, Name = "Work", Color = "#6366f1", UserId = TestUserId };
        List<TaskItem> mockTasks = new List<TaskItem>
        {
            new TaskItem
            {
                Id = 1,
                Title = "Test Task 1",
                Description = "Description 1",
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow,
                CategoryId = 1,
                Category = sampleCategory,
                UserId = TestUserId
            },
            new TaskItem
            {
                Id = 2,
                Title = "Test Task 2",
                Description = "Description 2",
                IsCompleted = true,
                CreatedAt = DateTime.UtcNow,
                CategoryId = null,
                Category = null,
                UserId = TestUserId
            }
        };

        _repositoryMock
            .Setup(repo => repo.GetAllByUserIdAsync(TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockTasks);

        // Act
        List<TaskDto> result = await _taskService.GetAllTasksAsync(TestUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Equal(1, result[0].Id);
        Assert.Equal("Test Task 1", result[0].Title);
        Assert.False(result[0].IsCompleted);
        Assert.Equal(1, result[0].CategoryId);
        Assert.NotNull(result[0].Category);
        Assert.Equal("Work", result[0].Category!.Name);

        Assert.Equal(2, result[1].Id);
        Assert.Equal("Test Task 2", result[1].Title);
        Assert.True(result[1].IsCompleted);
        Assert.Null(result[1].CategoryId);
        Assert.Null(result[1].Category);

        _repositoryMock.Verify(repo => repo.GetAllByUserIdAsync(TestUserId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllTasksAsync_WhenNoTasksExist_ReturnsEmptyList()
    {
        // Arrange
        _repositoryMock
            .Setup(repo => repo.GetAllByUserIdAsync(TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskItem>());

        // Act
        List<TaskDto> result = await _taskService.GetAllTasksAsync(TestUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
        _repositoryMock.Verify(repo => repo.GetAllByUserIdAsync(TestUserId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetTaskByIdAsync_WhenTaskFound_ReturnsTaskDto()
    {
        // Arrange
        int taskId = 10;
        Category category = new Category { Id = 2, Name = "Personal", Color = "#10b981", UserId = TestUserId };
        TaskItem mockTask = new TaskItem
        {
            Id = taskId,
            Title = "Specific Task",
            Description = "Specific Description",
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            CategoryId = 2,
            Category = category,
            UserId = TestUserId
        };

        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockTask);

        // Act
        TaskDto? result = await _taskService.GetTaskByIdAsync(taskId, TestUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(taskId, result.Id);
        Assert.Equal("Specific Task", result.Title);
        Assert.Equal("Specific Description", result.Description);
        Assert.False(result.IsCompleted);
        Assert.Equal(2, result.CategoryId);
        Assert.NotNull(result.Category);
        Assert.Equal("Personal", result.Category!.Name);
        _repositoryMock.Verify(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetTaskByIdAsync_WhenTaskNotFound_ReturnsNull()
    {
        // Arrange
        int taskId = 999;
        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem?)null);

        // Act
        TaskDto? result = await _taskService.GetTaskByIdAsync(taskId, TestUserId);

        // Assert
        Assert.Null(result);
        _repositoryMock.Verify(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateTaskAsync_ValidDto_CreatesAndReturnsDto()
    {
        // Arrange
        CreateTaskDto createDto = new CreateTaskDto("New Task", "New Description", 1);
        TaskItem persistedTask = new TaskItem
        {
            Id = 1,
            Title = createDto.Title,
            Description = createDto.Description,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            CategoryId = 1,
            Category = new Category { Id = 1, Name = "Work", Color = "#6366f1", UserId = TestUserId },
            UserId = TestUserId
        };

        _repositoryMock
            .Setup(repo => repo.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(persistedTask);

        // Act
        TaskDto result = await _taskService.CreateTaskAsync(createDto, TestUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("New Task", result.Title);
        Assert.Equal("New Description", result.Description);
        Assert.False(result.IsCompleted);
        Assert.Equal(1, result.CategoryId);
        Assert.NotNull(result.Category);
        _repositoryMock.Verify(repo => repo.AddAsync(
            It.Is<TaskItem>(t => t.Title == "New Task" && t.Description == "New Description" && !t.IsCompleted && t.CategoryId == 1 && t.UserId == TestUserId),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateTaskAsync_WhenTaskFound_UpdatesAndReturnsDto()
    {
        // Arrange
        int taskId = 5;
        UpdateTaskDto updateDto = new UpdateTaskDto("Updated Title", "Updated Description", true, 3);
        TaskItem existingTask = new TaskItem
        {
            Id = taskId,
            Title = "Old Title",
            Description = "Old Description",
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            CategoryId = 1,
            Category = new Category { Id = 1, Name = "Old Category", Color = "#000", UserId = TestUserId },
            UserId = TestUserId
        };

        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTask);

        _repositoryMock
            .Setup(repo => repo.UpdateAsync(existingTask, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        TaskDto? result = await _taskService.UpdateTaskAsync(taskId, updateDto, TestUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(taskId, result.Id);
        Assert.Equal("Updated Title", result.Title);
        Assert.Equal("Updated Description", result.Description);
        Assert.True(result.IsCompleted);
        Assert.Equal(3, result.CategoryId);
        _repositoryMock.Verify(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.UpdateAsync(existingTask, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateTaskAsync_WhenTaskNotFound_ReturnsNull()
    {
        // Arrange
        int taskId = 999;
        UpdateTaskDto updateDto = new UpdateTaskDto("Updated Title", "Updated Description", true, null);

        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem?)null);

        // Act
        TaskDto? result = await _taskService.UpdateTaskAsync(taskId, updateDto, TestUserId);

        // Assert
        Assert.Null(result);
        _repositoryMock.Verify(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteTaskAsync_WhenTaskFound_DeletesAndReturnsTrue()
    {
        // Arrange
        int taskId = 3;
        TaskItem existingTask = new TaskItem
        {
            Id = taskId,
            Title = "To Delete",
            Description = null,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            CategoryId = null,
            Category = null,
            UserId = TestUserId
        };

        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTask);

        _repositoryMock
            .Setup(repo => repo.DeleteAsync(existingTask, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        bool result = await _taskService.DeleteTaskAsync(taskId, TestUserId);

        // Assert
        Assert.True(result);
        _repositoryMock.Verify(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.DeleteAsync(existingTask, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteTaskAsync_WhenTaskNotFound_ReturnsFalse()
    {
        // Arrange
        int taskId = 999;
        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem?)null);

        // Act
        bool result = await _taskService.DeleteTaskAsync(taskId, TestUserId);

        // Assert
        Assert.False(result);
        _repositoryMock.Verify(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.DeleteAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
