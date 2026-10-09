using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WorkshopRegistration.Api.Models;

public class Registration
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkshopId { get; set; }

    [ForeignKey(nameof(WorkshopId))]
    public Workshop? Workshop { get; set; }

    [Required]
    [MaxLength(150)]
    public string AttendeeName { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string AttendeeEmail { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Active"; // "Active", "Cancelled"

    public int RegisteredBy { get; set; }

    [ForeignKey(nameof(RegisteredBy))]
    public User? RegisteredByUser { get; set; }

    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

    public int? CancelledBy { get; set; }

    [ForeignKey(nameof(CancelledBy))]
    public User? CancelledByUser { get; set; }

    public DateTime? CancelledAt { get; set; }
}
