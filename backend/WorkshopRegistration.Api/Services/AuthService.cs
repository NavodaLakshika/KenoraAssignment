using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WorkshopRegistration.Api.Data;
using WorkshopRegistration.Api.DTOs;
using WorkshopRegistration.Api.Models;

namespace WorkshopRegistration.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext db, IConfiguration config, ILogger<AuthService> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<AuthResponseDto?> AuthenticateAsync(LoginRequestDto loginDto)
    {
        try
        {
            _logger.LogInformation("Attempting authentication for email: {Email}", loginDto.Email);

            var user = await _db.Users.SingleOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());
            if (user == null)
            {
                _logger.LogWarning("Authentication failed: User with email {Email} not found.", loginDto.Email);
                return null;
            }

            if (!user.IsActive)
            {
                _logger.LogWarning("Authentication failed: Account {Email} is deactivated.", loginDto.Email);
                return null;
            }

            if (!VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                _logger.LogWarning("Authentication failed: Invalid password provided for {Email}.", loginDto.Email);
                return null;
            }

            var token = GenerateJwtToken(user);
            _logger.LogInformation("Authentication successful for {Email} with role {Role}.", user.Email, user.Role);

            return new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during authentication for {Email}.", loginDto.Email);
            throw;
        }
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 11);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during password verification.");
            return false;
        }
    }

    public string GenerateJwtToken(User user)
    {
        var jwtKey = _config["Jwt:Key"] ?? "WorkshopRegistrationSecretKey2026_HighSecurityKeyForProductionAndDev!";
        var jwtIssuer = _config["Jwt:Issuer"] ?? "WorkshopRegistration.Api";
        var jwtAudience = _config["Jwt:Audience"] ?? "WorkshopRegistration.Client";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("isActive", user.IsActive.ToString().ToLower())
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
