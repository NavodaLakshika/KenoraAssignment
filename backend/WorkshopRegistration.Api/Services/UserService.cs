using Microsoft.EntityFrameworkCore;
using WorkshopRegistration.Api.Data;
using WorkshopRegistration.Api.DTOs;
using WorkshopRegistration.Api.Models;

namespace WorkshopRegistration.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;
    private readonly IAuthService _authService;
    private readonly ILogger<UserService> _logger;

    public UserService(AppDbContext db, IAuthService authService, ILogger<UserService> logger)
    {
        _db = db;
        _authService = authService;
        _logger = logger;
    }

    public async Task<List<UserDto>> GetUsersAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all user accounts.");

            return await _db.Users
                .AsNoTracking()
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve user accounts.");
            throw;
        }
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving user account for ID: {UserId}", id);

            var user = await _db.Users.AsNoTracking().SingleOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                _logger.LogWarning("User with ID {UserId} was not found.", id);
                return null;
            }

            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve user {UserId}.", id);
            throw;
        }
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new user account: {Email} with role {Role}", dto.Email, dto.Role);

            var emailExists = await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.Trim().ToLower());
            if (emailExists)
            {
                _logger.LogWarning("User creation failed: email {Email} already exists.", dto.Email);
                throw new InvalidOperationException("A user with this email address already exists.");
            }

            var newUser = new User
            {
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim().ToLower(),
                PasswordHash = _authService.HashPassword(dto.Password),
                Role = dto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(newUser);
            await _db.SaveChangesAsync();

            _logger.LogInformation("User account created successfully with ID: {UserId}", newUser.Id);

            return new UserDto
            {
                Id = newUser.Id,
                FullName = newUser.FullName,
                Email = newUser.Email,
                Role = newUser.Role,
                IsActive = newUser.IsActive,
                CreatedAt = newUser.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user account for {Email}.", dto.Email);
            throw;
        }
    }
}
