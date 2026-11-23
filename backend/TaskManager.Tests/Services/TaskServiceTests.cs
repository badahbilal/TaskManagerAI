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

    public TaskServiceTests()
    {
        _repositoryMock = new Mock<ITaskRepository>();
        _taskService = new TaskService(_repositoryMock.Object);
    }

    [Fact]
    public async Task GetAllTasksAsync_WhenTasksExist_ReturnsMappedDtos()
    {
        // Arrange
        List<TaskItem> mockTasks = new List<TaskItem>
        {
            new TaskItem
            {
                Id = 1,
                Title = "Test Task 1",
                Description = "Description 1",
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            },
            new TaskItem
            {
                Id = 2,
                Title = "Test Task 2",
                Description = "Description 2",
                IsCompleted = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        _repositoryMock
            .Setup(repo => repo.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockTasks);

        // Act
        List<TaskDto> result = await _taskService.GetAllTasksAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Equal(1, result[0].Id);
        Assert.Equal("Test Task 1", result[0].Title);
        Assert.False(result[0].IsCompleted);
        Assert.Equal(2, result[1].Id);
        Assert.Equal("Test Task 2", result[1].Title);
        Assert.True(result[1].IsCompleted);
        _repositoryMock.Verify(repo => repo.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllTasksAsync_WhenNoTasksExist_ReturnsEmptyList()
    {
        // Arrange
        _repositoryMock
            .Setup(repo => repo.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskItem>());

        // Act
        List<TaskDto> result = await _taskService.GetAllTasksAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
        _repositoryMock.Verify(repo => repo.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetTaskByIdAsync_WhenTaskFound_ReturnsTaskDto()
    {
        // Arrange
        int taskId = 10;
        TaskItem mockTask = new TaskItem
        {
            Id = taskId,
            Title = "Specific Task",
            Description = "Specific Description",
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockTask);

        // Act
        TaskDto? result = await _taskService.GetTaskByIdAsync(taskId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(taskId, result.Id);
        Assert.Equal("Specific Task", result.Title);
        Assert.Equal("Specific Description", result.Description);
        Assert.False(result.IsCompleted);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetTaskByIdAsync_WhenTaskNotFound_ReturnsNull()
    {
        // Arrange
        int taskId = 999;
        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem?)null);

        // Act
        TaskDto? result = await _taskService.GetTaskByIdAsync(taskId);

        // Assert
        Assert.Null(result);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateTaskAsync_ValidDto_CreatesAndReturnsDto()
    {
        // Arrange
        CreateTaskDto createDto = new CreateTaskDto("New Task", "New Description");
        TaskItem persistedTask = new TaskItem
        {
            Id = 1,
            Title = createDto.Title,
            Description = createDto.Description,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _repositoryMock
            .Setup(repo => repo.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(persistedTask);

        // Act
        TaskDto result = await _taskService.CreateTaskAsync(createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("New Task", result.Title);
        Assert.Equal("New Description", result.Description);
        Assert.False(result.IsCompleted);
        _repositoryMock.Verify(repo => repo.AddAsync(
            It.Is<TaskItem>(t => t.Title == "New Task" && t.Description == "New Description" && !t.IsCompleted),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateTaskAsync_WhenTaskFound_UpdatesAndReturnsDto()
    {
        // Arrange
        int taskId = 5;
        UpdateTaskDto updateDto = new UpdateTaskDto("Updated Title", "Updated Description", true);
        TaskItem existingTask = new TaskItem
        {
            Id = taskId,
            Title = "Old Title",
            Description = "Old Description",
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTask);

        _repositoryMock
            .Setup(repo => repo.UpdateAsync(existingTask, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        TaskDto? result = await _taskService.UpdateTaskAsync(taskId, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(taskId, result.Id);
        Assert.Equal("Updated Title", result.Title);
        Assert.Equal("Updated Description", result.Description);
        Assert.True(result.IsCompleted);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.UpdateAsync(existingTask, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateTaskAsync_WhenTaskNotFound_ReturnsNull()
    {
        // Arrange
        int taskId = 999;
        UpdateTaskDto updateDto = new UpdateTaskDto("Updated Title", "Updated Description", true);

        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem?)null);

        // Act
        TaskDto? result = await _taskService.UpdateTaskAsync(taskId, updateDto);

        // Assert
        Assert.Null(result);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()), Times.Once);
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
            CreatedAt = DateTime.UtcNow
        };

        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTask);

        _repositoryMock
            .Setup(repo => repo.DeleteAsync(existingTask, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        bool result = await _taskService.DeleteTaskAsync(taskId);

        // Assert
        Assert.True(result);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.DeleteAsync(existingTask, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteTaskAsync_WhenTaskNotFound_ReturnsFalse()
    {
        // Arrange
        int taskId = 999;
        _repositoryMock
            .Setup(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem?)null);

        // Act
        bool result = await _taskService.DeleteTaskAsync(taskId);

        // Assert
        Assert.False(result);
        _repositoryMock.Verify(repo => repo.GetByIdAsync(taskId, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.DeleteAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
