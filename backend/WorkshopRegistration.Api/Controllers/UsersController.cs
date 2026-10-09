using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkshopRegistration.Api.DTOs;
using WorkshopRegistration.Api.Services;

namespace WorkshopRegistration.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        try
        {
            _logger.LogInformation("Admin requested list of all users.");
            var users = await _userService.GetUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch users in UsersController.");
            return StatusCode(500, new { message = "An error occurred while fetching users." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in user creation request.");
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Admin creating user account: {Email} ({Role})", dto.Email, dto.Role);
            var newUser = await _userService.CreateUserAsync(dto);
            return StatusCode(201, newUser);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Validation failure in CreateUser: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user account for {Email}.", dto.Email);
            return StatusCode(500, new { message = "An unexpected error occurred while creating the user." });
        }
    }
}
