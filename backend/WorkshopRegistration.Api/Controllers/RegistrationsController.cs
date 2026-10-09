using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkshopRegistration.Api.DTOs;
using WorkshopRegistration.Api.Services;

namespace WorkshopRegistration.Api.Controllers;

[Authorize(Roles = "Manager,Staff")]
[ApiController]
[Route("api/[controller]")]
public class RegistrationsController : ControllerBase
{
    private readonly IRegistrationService _registrationService;
    private readonly ILogger<RegistrationsController> _logger;

    public RegistrationsController(IRegistrationService registrationService, ILogger<RegistrationsController> logger)
    {
        _registrationService = registrationService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RegistrationDto>>> GetRegistrations(
        [FromQuery] int? workshopId,
        [FromQuery] string? status)
    {
        try
        {
            _logger.LogInformation("Retrieving registrations list (workshopId: {WorkshopId}, status: {Status})", workshopId, status);
            var list = await _registrationService.GetRegistrationsAsync(workshopId, status);
            return Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve registrations.");
            return StatusCode(500, new { message = "An error occurred while fetching registrations." });
        }
    }

    [HttpGet("{id:int}/history")]
    public async Task<ActionResult<RegistrationHistoryDto>> GetRegistrationHistory(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving history for registration ID {Id}.", id);
            var history = await _registrationService.GetRegistrationHistoryAsync(id);

            if (history == null)
            {
                _logger.LogWarning("Registration record {Id} not found.", id);
                return NotFound(new { message = "Registration record not found." });
            }

            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve history for registration ID {Id}.", id);
            return StatusCode(500, new { message = "An error occurred while fetching registration history." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> RegisterAttendee([FromBody] CreateRegistrationDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in RegisterAttendee request.");
                return BadRequest(ModelState);
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            _logger.LogInformation("Staff {UserId} registering attendee {Email} for workshop {WorkshopId}.", 
                userId, dto.AttendeeEmail, dto.WorkshopId);

            var result = await _registrationService.RegisterAttendeeAsync(dto, userId);

            if (!result.Success)
            {
                _logger.LogWarning("Registration rejected with status {Status}: {Message}", result.StatusCode, result.Message);
                return StatusCode(result.StatusCode, new { message = result.Message });
            }

            _logger.LogInformation("Registration successfully created with ID: {RegId}", result.Registration?.Id);
            return StatusCode(result.StatusCode, result.Registration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in RegisterAttendee action for workshop {WorkshopId}.", dto.WorkshopId);
            return StatusCode(500, new { message = "An unexpected error occurred during attendee registration." });
        }
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> CancelRegistration(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            _logger.LogInformation("User {UserId} requesting cancellation of registration {Id}.", userId, id);

            var result = await _registrationService.CancelRegistrationAsync(id, userId);

            if (!result.Success)
            {
                _logger.LogWarning("Cancellation rejected with status {Status}: {Message}", result.StatusCode, result.Message);
                return StatusCode(result.StatusCode, new { message = result.Message });
            }

            _logger.LogInformation("Registration {Id} successfully cancelled by user {UserId}.", id, userId);
            return StatusCode(result.StatusCode, result.Registration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in CancelRegistration for ID {Id}.", id);
            return StatusCode(500, new { message = "An unexpected error occurred during cancellation." });
        }
    }
}
