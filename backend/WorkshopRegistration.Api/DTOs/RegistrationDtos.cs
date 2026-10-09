using System.ComponentModel.DataAnnotations;

namespace WorkshopRegistration.Api.DTOs;

public class RegistrationDto
{
    public int Id { get; set; }
    public int WorkshopId { get; set; }
    public string WorkshopCode { get; set; } = string.Empty;
    public string WorkshopTitle { get; set; } = string.Empty;
    public string AttendeeName { get; set; } = string.Empty;
    public string AttendeeEmail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int RegisteredBy { get; set; }
    public string RegisteredByName { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public int? CancelledBy { get; set; }
    public string? CancelledByName { get; set; }
    public DateTime? CancelledAt { get; set; }
}

public class CreateRegistrationDto
{
    [Required]
    public int WorkshopId { get; set; }

    [Required]
    [MaxLength(150)]
    public string AttendeeName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string AttendeeEmail { get; set; } = string.Empty;
}

public class RegistrationHistoryDto
{
    public int Id { get; set; }
    public int WorkshopId { get; set; }
    public string WorkshopCode { get; set; } = string.Empty;
    public string WorkshopTitle { get; set; } = string.Empty;
    public string AttendeeName { get; set; } = string.Empty;
    public string AttendeeEmail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int RegisteredBy { get; set; }
    public string RegisteredByName { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public int? CancelledBy { get; set; }
    public string? CancelledByName { get; set; }
    public DateTime? CancelledAt { get; set; }
    public List<AuditLogDto> AuditTrail { get; set; } = new();
}

public class AuditLogDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public string Details { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
