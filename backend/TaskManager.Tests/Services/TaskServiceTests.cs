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
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
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
                DueDate = today,
                IsDaily = false,
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
                DueDate = today,
                IsDaily = false,
                CategoryId = null,
                Category = null,
                UserId = TestUserId
            }
        };

        _repositoryMock
            .Setup(repo => repo.GetPastDailyTemplatesAsync(TestUserId, today, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskItem>());

        _repositoryMock
            .Setup(repo => repo.GetAllByUserIdAndDateAsync(TestUserId, today, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockTasks);

        // Act
        List<TaskDto> result = await _taskService.GetAllTasksAsync(TestUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Equal(1, result[0].Id);
        Assert.Equal("Test Task 1", result[0].Title);
        Assert.False(result[0].IsCompleted);
        Assert.Equal(today, result[0].DueDate);
        Assert.False(result[0].IsDaily);
        Assert.Equal(1, result[0].CategoryId);
        Assert.NotNull(result[0].Category);
        Assert.Equal("Work", result[0].Category!.Name);

        Assert.Equal(2, result[1].Id);
        Assert.Equal("Test Task 2", result[1].Title);
        Assert.True(result[1].IsCompleted);
        Assert.Null(result[1].CategoryId);
        Assert.Null(result[1].Category);
    }

    [Fact]
    public async Task GetAllTasksAsync_WhenNoTasksExist_ReturnsEmptyList()
    {
        // Arrange
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        _repositoryMock
            .Setup(repo => repo.GetPastDailyTemplatesAsync(TestUserId, today, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskItem>());

        _repositoryMock
            .Setup(repo => repo.GetAllByUserIdAndDateAsync(TestUserId, today, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskItem>());

        // Act
        List<TaskDto> result = await _taskService.GetAllTasksAsync(TestUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetTasksByDateAsync_WhenToday_SyncsPastDailyTemplates()
    {
        // Arrange
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        DateOnly yesterday = today.AddDays(-1);

        TaskItem pastDaily = new TaskItem
        {
            Id = 99,
            Title = "Morning Standup",
            Description = "Review blockers",
            IsDaily = true,
            DueDate = yesterday,
            CategoryId = 1,
            UserId = TestUserId
        };

        List<TaskItem> pastTemplates = new List<TaskItem> { pastDaily };
        List<TaskItem> existingTodayTasks = new List<TaskItem>();

        _repositoryMock
            .Setup(repo => repo.GetPastDailyTemplatesAsync(TestUserId, today, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pastTemplates);

        _repositoryMock
            .Setup(repo => repo.GetAllByUserIdAndDateAsync(TestUserId, today, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTodayTasks);

        _repositoryMock
            .Setup(repo => repo.AddRangeAsync(It.IsAny<List<TaskItem>>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        List<TaskDto> result = await _taskService.GetTasksByDateAsync(TestUserId, today);

        // Assert
        _repositoryMock.Verify(repo => repo.GetPastDailyTemplatesAsync(TestUserId, today, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(repo => repo.AddRangeAsync(
            It.Is<List<TaskItem>>(list => list.Count == 1 && list[0].Title == "Morning Standup" && list[0].DueDate == today && list[0].IsDaily),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetTasksByDateAsync_WhenPastDate_DoesNotSyncDailyTemplates()
    {
        // Arrange
        DateOnly pastDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-3);
        _repositoryMock
            .Setup(repo => repo.GetAllByUserIdAndDateAsync(TestUserId, pastDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskItem>());

        // Act
        List<TaskDto> result = await _taskService.GetTasksByDateAsync(TestUserId, pastDate);

        // Assert
        Assert.Empty(result);
        _repositoryMock.Verify(repo => repo.GetPastDailyTemplatesAsync(It.IsAny<int>(), It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()), Times.Never);
        _repositoryMock.Verify(repo => repo.GetAllByUserIdAndDateAsync(TestUserId, pastDate, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetUpcomingTasksAsync_ReturnsUpcomingTasks()
    {
        // Arrange
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        DateOnly tomorrow = today.AddDays(1);
        List<TaskItem> upcoming = new List<TaskItem>
        {
            new TaskItem
            {
                Id = 1,
                Title = "Future Task",
                DueDate = tomorrow,
                UserId = TestUserId
            }
        };

        _repositoryMock
            .Setup(repo => repo.GetUpcomingByUserIdAsync(TestUserId, today, It.IsAny<CancellationToken>()))
            .ReturnsAsync(upcoming);

        // Act
        List<TaskDto> result = await _taskService.GetUpcomingTasksAsync(TestUserId);

        // Assert
        Assert.Single(result);
        Assert.Equal("Future Task", result[0].Title);
        Assert.Equal(tomorrow, result[0].DueDate);
        _repositoryMock.Verify(repo => repo.GetUpcomingByUserIdAsync(TestUserId, today, It.IsAny<CancellationToken>()), Times.Once);
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
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        CreateTaskDto createDto = new CreateTaskDto("New Task", "New Description", 1, today, true);
        TaskItem persistedTask = new TaskItem
        {
            Id = 1,
            Title = createDto.Title,
            Description = createDto.Description,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            DueDate = today,
            IsDaily = true,
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
        Assert.Equal(today, result.DueDate);
        Assert.True(result.IsDaily);
        Assert.Equal(1, result.CategoryId);
        Assert.NotNull(result.Category);
        _repositoryMock.Verify(repo => repo.AddAsync(
            It.Is<TaskItem>(t => t.Title == "New Task" && t.Description == "New Description" && !t.IsCompleted && t.CategoryId == 1 && t.UserId == TestUserId && t.IsDaily),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateTaskAsync_WithPastDueDate_ThrowsInvalidOperationException()
    {
        // Arrange
        DateOnly pastDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);
        CreateTaskDto createDto = new CreateTaskDto("Past Task", "Desc", null, pastDate, false);

        // Act & Assert
        InvalidOperationException ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _taskService.CreateTaskAsync(createDto, TestUserId));
        Assert.Equal("Cannot create tasks in the past.", ex.Message);
        _repositoryMock.Verify(repo => repo.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateTaskAsync_WhenTaskFound_UpdatesAndReturnsDto()
    {
        // Arrange
        int taskId = 5;
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        UpdateTaskDto updateDto = new UpdateTaskDto("Updated Title", "Updated Description", true, 3, today, false);
        TaskItem existingTask = new TaskItem
        {
            Id = taskId,
            Title = "Old Title",
            Description = "Old Description",
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            DueDate = today,
            IsDaily = false,
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
        Assert.NotNull(result.CompletedAt);
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
    public async Task UpdateTaskAsync_WhenPastArchivedTask_ThrowsInvalidOperationException()
    {
        // Arrange
        int taskId = 6;
        DateOnly pastDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-2);
        TaskItem pastTask = new TaskItem
        {
            Id = taskId,
            Title = "Archived Task",
            DueDate = pastDate,
            UserId = TestUserId
        };
        UpdateTaskDto updateDto = new UpdateTaskDto("New Title", null, false, null);

        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pastTask);

        // Act & Assert
        InvalidOperationException ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _taskService.UpdateTaskAsync(taskId, updateDto, TestUserId));
        Assert.Equal("Past tasks are archived and cannot be modified.", ex.Message);
        _repositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateTaskAsync_WhenMovingTaskToPast_ThrowsInvalidOperationException()
    {
        // Arrange
        int taskId = 7;
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        DateOnly pastDate = today.AddDays(-1);
        TaskItem todayTask = new TaskItem
        {
            Id = taskId,
            Title = "Today Task",
            DueDate = today,
            UserId = TestUserId
        };
        UpdateTaskDto updateDto = new UpdateTaskDto("Today Task", null, false, null, pastDate);

        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(todayTask);

        // Act & Assert
        InvalidOperationException ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _taskService.UpdateTaskAsync(taskId, updateDto, TestUserId));
        Assert.Equal("Cannot move tasks to the past.", ex.Message);
        _repositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateTaskAsync_WhenFutureTaskMarkedCompleted_ThrowsInvalidOperationException()
    {
        // Arrange
        int taskId = 8;
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        DateOnly futureDate = today.AddDays(2);
        TaskItem futureTask = new TaskItem
        {
            Id = taskId,
            Title = "Future Task",
            DueDate = futureDate,
            UserId = TestUserId
        };
        UpdateTaskDto updateDto = new UpdateTaskDto("Future Task", null, true, null, futureDate);

        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(futureTask);

        // Act & Assert
        InvalidOperationException ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _taskService.UpdateTaskAsync(taskId, updateDto, TestUserId));
        Assert.Equal("Future tasks cannot be marked as completed before their due date.", ex.Message);
        _repositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateTaskAsync_WhenFutureTaskValid_UpdatesSuccessfully()
    {
        // Arrange
        int taskId = 9;
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        DateOnly futureDate = today.AddDays(2);
        TaskItem futureTask = new TaskItem
        {
            Id = taskId,
            Title = "Future Task",
            DueDate = futureDate,
            UserId = TestUserId
        };
        UpdateTaskDto updateDto = new UpdateTaskDto("Future Task Renamed", "New description", false, null, futureDate);

        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(futureTask);

        _repositoryMock
            .Setup(repo => repo.UpdateAsync(futureTask, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        TaskDto? result = await _taskService.UpdateTaskAsync(taskId, updateDto, TestUserId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Future Task Renamed", result.Title);
        Assert.False(result.IsCompleted);
        Assert.Null(result.CompletedAt);
        _repositoryMock.Verify(repo => repo.UpdateAsync(futureTask, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteTaskAsync_WhenTaskFound_DeletesAndReturnsTrue()
    {
        // Arrange
        int taskId = 3;
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
        TaskItem existingTask = new TaskItem
        {
            Id = taskId,
            Title = "To Delete",
            Description = null,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            DueDate = today,
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

    [Fact]
    public async Task DeleteTaskAsync_WhenPastArchivedTask_ThrowsInvalidOperationException()
    {
        // Arrange
        int taskId = 11;
        DateOnly pastDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);
        TaskItem pastTask = new TaskItem
        {
            Id = taskId,
            Title = "Archived Task",
            DueDate = pastDate,
            UserId = TestUserId
        };

        _repositoryMock
            .Setup(repo => repo.GetByIdAndUserIdAsync(taskId, TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(pastTask);

        // Act & Assert
        InvalidOperationException ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _taskService.DeleteTaskAsync(taskId, TestUserId));
        Assert.Equal("Past tasks are archived and cannot be deleted.", ex.Message);
        _repositoryMock.Verify(repo => repo.DeleteAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
