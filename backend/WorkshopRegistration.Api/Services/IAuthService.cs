using WorkshopRegistration.Api.DTOs;
using WorkshopRegistration.Api.Models;

namespace WorkshopRegistration.Api.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> AuthenticateAsync(LoginRequestDto loginDto);
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
    string GenerateJwtToken(User user);
}
