using System;
using System.Threading;
using System.Threading.Tasks;
using TaskManager.Application.DTOs;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        string normalizedEmail = request.Email.Trim().ToLowerInvariant();
        bool emailExists = await _userRepository.EmailExistsAsync(normalizedEmail, cancellationToken);
        if (emailExists)
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }

        string passwordHash = _passwordHasher.HashPassword(request.Password);

        User newUser = new User
        {
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        };

        User createdUser = await _userRepository.AddAsync(newUser, cancellationToken);
        string token = _jwtService.GenerateToken(createdUser);

        UserDto userDto = new UserDto(createdUser.Id, createdUser.FullName, createdUser.Email);
        return new AuthResponseDto(token, userDto);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        string normalizedEmail = request.Email.Trim().ToLowerInvariant();
        User? user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (user == null)
        {
            return null;
        }

        bool isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return null;
        }

        string token = _jwtService.GenerateToken(user);
        UserDto userDto = new UserDto(user.Id, user.FullName, user.Email);
        return new AuthResponseDto(token, userDto);
    }
}
