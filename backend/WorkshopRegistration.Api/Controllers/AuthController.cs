using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkshopRegistration.Api.DTOs;
using WorkshopRegistration.Api.Services;

namespace WorkshopRegistration.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, IUserService userService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _userService = userService;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in login request.");
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Processing login request for: {Email}", dto.Email);
            var result = await _authService.AuthenticateAsync(dto);

            if (result == null)
            {
                _logger.LogWarning("Unauthorized login attempt for: {Email}", dto.Email);
                return Unauthorized(new { message = "Invalid email or password, or account is disabled." });
            }

            _logger.LogInformation("User {Email} logged in successfully.", dto.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred during login for {Email}", dto.Email);
            return StatusCode(500, new { message = "An internal server error occurred during authentication." });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            {
                _logger.LogWarning("Unable to extract user ID from claim token.");
                return Unauthorized();
            }

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Current user ID {UserId} was not found or is inactive.", userId);
                return Unauthorized();
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error retrieving current user.");
            return StatusCode(500, new { message = "An error occurred retrieving user profile." });
        }
    }
}
