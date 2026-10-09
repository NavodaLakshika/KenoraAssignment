using WorkshopRegistration.Api.DTOs;

namespace WorkshopRegistration.Api.Services;

public interface IWorkshopService
{
    Task<List<WorkshopDto>> GetWorkshopsAsync(WorkshopQueryDto query);
    Task<WorkshopDto?> GetWorkshopByIdAsync(int id);
    Task<WorkshopDto> CreateWorkshopAsync(CreateWorkshopDto dto, int userId);
    Task<WorkshopDto?> UpdateWorkshopAsync(int id, UpdateWorkshopDto dto);
}
