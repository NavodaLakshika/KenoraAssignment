using System.ComponentModel.DataAnnotations;

namespace WorkshopRegistration.Api.DTOs;

public class WorkshopDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Instructor { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public int Capacity { get; set; }
    public string Status { get; set; } = string.Empty;
    public int AvailableSeats { get; set; }
    public int ActiveRegistrationsCount { get; set; }
    public int CreatedBy { get; set; }
    public string CreatorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateWorkshopDto
{
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Instructor { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Location { get; set; } = "Centre A";

    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }

    [Required]
    [Range(1, 500)]
    public int Capacity { get; set; }

    [Required]
    [RegularExpression("^(Scheduled|InProgress|Completed|Cancelled)$", ErrorMessage = "Invalid status")]
    public string Status { get; set; } = "Scheduled";
}

public class UpdateWorkshopDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Instructor { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Location { get; set; } = "Centre A";

    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }

    [Required]
    [Range(1, 500)]
    public int Capacity { get; set; }

    [Required]
    [RegularExpression("^(Scheduled|InProgress|Completed|Cancelled)$", ErrorMessage = "Invalid status")]
    public string Status { get; set; } = "Scheduled";
}

public class WorkshopQueryDto
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public string? Status { get; set; }
    public bool? AvailableOnly { get; set; }
    public string? Search { get; set; }
}
