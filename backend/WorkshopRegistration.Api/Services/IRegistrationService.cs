using WorkshopRegistration.Api.DTOs;

namespace WorkshopRegistration.Api.Services;

public class RegistrationResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public RegistrationDto? Registration { get; set; }
    public int StatusCode { get; set; } = 200;
}

public class CancellationResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public RegistrationDto? Registration { get; set; }
    public int StatusCode { get; set; } = 200;
}

public interface IRegistrationService
{
    Task<RegistrationResult> RegisterAttendeeAsync(CreateRegistrationDto dto, int userId);
    Task<CancellationResult> CancelRegistrationAsync(int registrationId, int userId);
    Task<List<RegistrationDto>> GetRegistrationsAsync(int? workshopId = null, string? status = null);
    Task<RegistrationHistoryDto?> GetRegistrationHistoryAsync(int registrationId);
}
