using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Application.Services;
using TaskManager.Domain.Entities;
using Xunit;

namespace TaskManager.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtServiceMock = new Mock<IJwtService>();

        _authService = new AuthService(
            _userRepositoryMock.Object,
            _passwordHasherMock.Object,
            _jwtServiceMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_WhenValidRequest_CreatesUserAndReturnsToken()
    {
        // Arrange
        RegisterRequestDto request = new RegisterRequestDto("Alice Smith", "alice@example.com", "Password123!");
        string hashedPassword = "hashed_password_salt";
        string generatedToken = "jwt.token.here";

        _userRepositoryMock
            .Setup(repo => repo.EmailExistsAsync("alice@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _passwordHasherMock
            .Setup(hasher => hasher.HashPassword("Password123!"))
            .Returns(hashedPassword);

        User createdUser = new User
        {
            Id = 1,
            FullName = "Alice Smith",
            Email = "alice@example.com",
            PasswordHash = hashedPassword,
            CreatedAt = DateTime.UtcNow
        };

        _userRepositoryMock
            .Setup(repo => repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdUser);

        _jwtServiceMock
            .Setup(jwt => jwt.GenerateToken(createdUser))
            .Returns(generatedToken);

        // Act
        AuthResponseDto result = await _authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(generatedToken, result.Token);
        Assert.NotNull(result.User);
        Assert.Equal(1, result.User.Id);
        Assert.Equal("Alice Smith", result.User.FullName);
        Assert.Equal("alice@example.com", result.User.Email);

        _userRepositoryMock.Verify(repo => repo.AddAsync(
            It.Is<User>(u => u.FullName == "Alice Smith" && u.Email == "alice@example.com" && u.PasswordHash == hashedPassword),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailAlreadyExists_ThrowsInvalidOperationException()
    {
        // Arrange
        RegisterRequestDto request = new RegisterRequestDto("Bob Jones", "bob@example.com", "Password123!");

        _userRepositoryMock
            .Setup(repo => repo.EmailExistsAsync("bob@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act & Assert
        InvalidOperationException ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _authService.RegisterAsync(request));

        Assert.Contains("already exists", ex.Message);
        _userRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_WhenCredentialsValid_ReturnsAuthResponse()
    {
        // Arrange
        LoginRequestDto request = new LoginRequestDto("alice@example.com", "Password123!");
        string hashedPassword = "hashed_password_salt";
        string generatedToken = "jwt.token.here";

        User existingUser = new User
        {
            Id = 1,
            FullName = "Alice Smith",
            Email = "alice@example.com",
            PasswordHash = hashedPassword,
            CreatedAt = DateTime.UtcNow
        };

        _userRepositoryMock
            .Setup(repo => repo.GetByEmailAsync("alice@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        _passwordHasherMock
            .Setup(hasher => hasher.VerifyPassword("Password123!", hashedPassword))
            .Returns(true);

        _jwtServiceMock
            .Setup(jwt => jwt.GenerateToken(existingUser))
            .Returns(generatedToken);

        // Act
        AuthResponseDto? result = await _authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(generatedToken, result.Token);
        Assert.Equal(1, result.User.Id);
        Assert.Equal("Alice Smith", result.User.FullName);
        Assert.Equal("alice@example.com", result.User.Email);
    }

    [Fact]
    public async Task LoginAsync_WhenUserNotFound_ReturnsNull()
    {
        // Arrange
        LoginRequestDto request = new LoginRequestDto("nonexistent@example.com", "Password123!");

        _userRepositoryMock
            .Setup(repo => repo.GetByEmailAsync("nonexistent@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act
        AuthResponseDto? result = await _authService.LoginAsync(request);

        // Assert
        Assert.Null(result);
        _passwordHasherMock.Verify(hasher => hasher.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_WhenPasswordInvalid_ReturnsNull()
    {
        // Arrange
        LoginRequestDto request = new LoginRequestDto("alice@example.com", "WrongPassword");
        string hashedPassword = "hashed_password_salt";

        User existingUser = new User
        {
            Id = 1,
            FullName = "Alice Smith",
            Email = "alice@example.com",
            PasswordHash = hashedPassword,
            CreatedAt = DateTime.UtcNow
        };

        _userRepositoryMock
            .Setup(repo => repo.GetByEmailAsync("alice@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        _passwordHasherMock
            .Setup(hasher => hasher.VerifyPassword("WrongPassword", hashedPassword))
            .Returns(false);

        // Act
        AuthResponseDto? result = await _authService.LoginAsync(request);

        // Assert
        Assert.Null(result);
        _jwtServiceMock.Verify(jwt => jwt.GenerateToken(It.IsAny<User>()), Times.Never);
    }
}
