using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkshopRegistration.Api.DTOs;
using WorkshopRegistration.Api.Services;

namespace WorkshopRegistration.Api.Controllers;

[Authorize(Roles = "Manager,Staff")]
[ApiController]
[Route("api/[controller]")]
public class WorkshopsController : ControllerBase
{
    private readonly IWorkshopService _workshopService;
    private readonly ILogger<WorkshopsController> _logger;

    public WorkshopsController(IWorkshopService workshopService, ILogger<WorkshopsController> logger)
    {
        _workshopService = workshopService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkshopDto>>> GetWorkshops([FromQuery] WorkshopQueryDto query)
    {
        try
        {
            _logger.LogInformation("Endpoint GET /api/workshops called with query: {@Query}", query);
            var workshops = await _workshopService.GetWorkshopsAsync(query);
            return Ok(workshops);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing GET /api/workshops.");
            return StatusCode(500, new { message = "An error occurred while retrieving workshops." });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<WorkshopDto>> GetWorkshopById(int id)
    {
        try
        {
            _logger.LogInformation("Endpoint GET /api/workshops/{Id} called.", id);
            var workshop = await _workshopService.GetWorkshopByIdAsync(id);

            if (workshop == null)
            {
                _logger.LogWarning("Workshop with ID {Id} not found.", id);
                return NotFound(new { message = "Workshop not found." });
            }

            return Ok(workshop);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing GET /api/workshops/{Id}.", id);
            return StatusCode(500, new { message = "An error occurred while retrieving workshop details." });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<WorkshopDto>> CreateWorkshop([FromBody] CreateWorkshopDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in CreateWorkshop.");
                return BadRequest(ModelState);
            }

            if (dto.EndDateTime <= dto.StartDateTime)
            {
                _logger.LogWarning("CreateWorkshop invalid time range: End <= Start.");
                return BadRequest(new { message = "End time must be after start time." });
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            _logger.LogInformation("Manager {UserId} creating workshop {Code}.", userId, dto.Code);

            var created = await _workshopService.CreateWorkshopAsync(dto, userId);
            return CreatedAtAction(nameof(GetWorkshopById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Validation exception in CreateWorkshop: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing POST /api/workshops for {Code}.", dto.Code);
            return StatusCode(500, new { message = "An error occurred while creating the workshop." });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<WorkshopDto>> UpdateWorkshop(int id, [FromBody] UpdateWorkshopDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in UpdateWorkshop for ID {Id}.", id);
                return BadRequest(ModelState);
            }

            if (dto.EndDateTime <= dto.StartDateTime)
            {
                _logger.LogWarning("UpdateWorkshop invalid time range: End <= Start for ID {Id}.", id);
                return BadRequest(new { message = "End time must be after start time." });
            }

            _logger.LogInformation("Updating workshop ID {Id}.", id);
            var updated = await _workshopService.UpdateWorkshopAsync(id, dto);

            if (updated == null)
            {
                _logger.LogWarning("UpdateWorkshop failed: Workshop ID {Id} not found.", id);
                return NotFound(new { message = "Workshop not found." });
            }

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Validation failure in UpdateWorkshop: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating workshop ID {Id}.", id);
            return StatusCode(500, new { message = "An error occurred while updating the workshop." });
        }
    }
}
