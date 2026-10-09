using Microsoft.EntityFrameworkCore;
using WorkshopRegistration.Api.Data;
using WorkshopRegistration.Api.DTOs;
using WorkshopRegistration.Api.Models;

namespace WorkshopRegistration.Api.Services;

public class WorkshopService : IWorkshopService
{
    private readonly AppDbContext _db;
    private readonly ILogger<WorkshopService> _logger;

    public WorkshopService(AppDbContext db, ILogger<WorkshopService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<WorkshopDto>> GetWorkshopsAsync(WorkshopQueryDto query)
    {
        try
        {
            _logger.LogInformation("Retrieving workshops list with query filters: {@Query}", query);

            var dbQuery = _db.Workshops
                .Include(w => w.Creator)
                .Include(w => w.Registrations)
                .AsNoTracking()
                .AsQueryable();

            if (query.From.HasValue)
            {
                dbQuery = dbQuery.Where(w => w.StartDateTime >= query.From.Value);
            }

            if (query.To.HasValue)
            {
                var endOfDay = query.To.Value.Date.AddDays(1).AddTicks(-1);
                dbQuery = dbQuery.Where(w => w.StartDateTime <= endOfDay);
            }

            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                dbQuery = dbQuery.Where(w => w.Status == query.Status);
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var searchLower = query.Search.Trim().ToLower();
                dbQuery = dbQuery.Where(w =>
                    w.Title.ToLower().Contains(searchLower) ||
                    w.Code.ToLower().Contains(searchLower) ||
                    w.Instructor.ToLower().Contains(searchLower) ||
                    w.Location.ToLower().Contains(searchLower));
            }

            var workshops = await dbQuery
                .OrderBy(w => w.StartDateTime)
                .Select(w => new WorkshopDto
                {
                    Id = w.Id,
                    Code = w.Code,
                    Title = w.Title,
                    Instructor = w.Instructor,
                    Location = w.Location,
                    StartDateTime = w.StartDateTime,
                    EndDateTime = w.EndDateTime,
                    Capacity = w.Capacity,
                    Status = w.Status,
                    ActiveRegistrationsCount = w.Registrations.Count(r => r.Status == "Active"),
                    AvailableSeats = w.Capacity - w.Registrations.Count(r => r.Status == "Active"),
                    CreatedBy = w.CreatedBy,
                    CreatorName = w.Creator != null ? w.Creator.FullName : "Unknown",
                    CreatedAt = w.CreatedAt,
                    UpdatedAt = w.UpdatedAt
                })
                .ToListAsync();

            if (query.AvailableOnly == true)
            {
                workshops = workshops.Where(w => w.AvailableSeats > 0).ToList();
            }

            _logger.LogInformation("Successfully retrieved {Count} workshops.", workshops.Count);
            return workshops;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve workshops due to an unexpected error.");
            throw;
        }
    }

    public async Task<WorkshopDto?> GetWorkshopByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving workshop details for ID: {WorkshopId}", id);

            var workshop = await _db.Workshops
                .Include(w => w.Creator)
                .Include(w => w.Registrations)
                .AsNoTracking()
                .SingleOrDefaultAsync(w => w.Id == id);

            if (workshop == null)
            {
                _logger.LogWarning("Workshop with ID {WorkshopId} was not found.", id);
                return null;
            }

            var activeCount = workshop.Registrations.Count(r => r.Status == "Active");

            return new WorkshopDto
            {
                Id = workshop.Id,
                Code = workshop.Code,
                Title = workshop.Title,
                Instructor = workshop.Instructor,
                Location = workshop.Location,
                StartDateTime = workshop.StartDateTime,
                EndDateTime = workshop.EndDateTime,
                Capacity = workshop.Capacity,
                Status = workshop.Status,
                ActiveRegistrationsCount = activeCount,
                AvailableSeats = workshop.Capacity - activeCount,
                CreatedBy = workshop.CreatedBy,
                CreatorName = workshop.Creator?.FullName ?? "Unknown",
                CreatedAt = workshop.CreatedAt,
                UpdatedAt = workshop.UpdatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve workshop {WorkshopId}.", id);
            throw;
        }
    }

    public async Task<WorkshopDto> CreateWorkshopAsync(CreateWorkshopDto dto, int userId)
    {
        try
        {
            _logger.LogInformation("User {UserId} creating new workshop: {Code} - {Title}", userId, dto.Code, dto.Title);

            var codeUpper = dto.Code.Trim().ToUpper();
            var codeExists = await _db.Workshops.AnyAsync(w => w.Code.ToUpper() == codeUpper);
            if (codeExists)
            {
                _logger.LogWarning("Attempt to create duplicate workshop code: {Code}", codeUpper);
                throw new InvalidOperationException($"Workshop code '{codeUpper}' is already taken.");
            }

            var workshop = new Workshop
            {
                Code = codeUpper,
                Title = dto.Title.Trim(),
                Instructor = dto.Instructor.Trim(),
                Location = dto.Location.Trim(),
                StartDateTime = dto.StartDateTime,
                EndDateTime = dto.EndDateTime,
                Capacity = dto.Capacity,
                Status = dto.Status,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Workshops.Add(workshop);
            await _db.SaveChangesAsync();

            var creator = await _db.Users.FindAsync(userId);
            _logger.LogInformation("Workshop created successfully with ID: {WorkshopId}", workshop.Id);

            return new WorkshopDto
            {
                Id = workshop.Id,
                Code = workshop.Code,
                Title = workshop.Title,
                Instructor = workshop.Instructor,
                Location = workshop.Location,
                StartDateTime = workshop.StartDateTime,
                EndDateTime = workshop.EndDateTime,
                Capacity = workshop.Capacity,
                Status = workshop.Status,
                ActiveRegistrationsCount = 0,
                AvailableSeats = workshop.Capacity,
                CreatedBy = workshop.CreatedBy,
                CreatorName = creator?.FullName ?? "Unknown",
                CreatedAt = workshop.CreatedAt,
                UpdatedAt = workshop.UpdatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating workshop {Code}.", dto.Code);
            throw;
        }
    }

    public async Task<WorkshopDto?> UpdateWorkshopAsync(int id, UpdateWorkshopDto dto)
    {
        try
        {
            _logger.LogInformation("Updating workshop ID: {WorkshopId}", id);

            var workshop = await _db.Workshops
                .Include(w => w.Registrations)
                .SingleOrDefaultAsync(w => w.Id == id);

            if (workshop == null)
            {
                _logger.LogWarning("Workshop ID {WorkshopId} not found for update.", id);
                return null;
            }

            var activeCount = workshop.Registrations.Count(r => r.Status == "Active");

            if (dto.Capacity < activeCount)
            {
                _logger.LogWarning("Cannot reduce workshop {WorkshopId} capacity to {NewCap} below active registrations count {ActiveCount}", id, dto.Capacity, activeCount);
                throw new InvalidOperationException($"Capacity cannot be reduced below current active registrations count ({activeCount}).");
            }

            workshop.Title = dto.Title.Trim();
            workshop.Instructor = dto.Instructor.Trim();
            workshop.Location = dto.Location.Trim();
            workshop.StartDateTime = dto.StartDateTime;
            workshop.EndDateTime = dto.EndDateTime;
            workshop.Capacity = dto.Capacity;
            workshop.Status = dto.Status;
            workshop.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var creator = await _db.Users.FindAsync(workshop.CreatedBy);
            _logger.LogInformation("Workshop ID {WorkshopId} successfully updated.", id);

            return new WorkshopDto
            {
                Id = workshop.Id,
                Code = workshop.Code,
                Title = workshop.Title,
                Instructor = workshop.Instructor,
                Location = workshop.Location,
                StartDateTime = workshop.StartDateTime,
                EndDateTime = workshop.EndDateTime,
                Capacity = workshop.Capacity,
                Status = workshop.Status,
                ActiveRegistrationsCount = activeCount,
                AvailableSeats = workshop.Capacity - activeCount,
                CreatedBy = workshop.CreatedBy,
                CreatorName = creator?.FullName ?? "Unknown",
                CreatedAt = workshop.CreatedAt,
                UpdatedAt = workshop.UpdatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating workshop {WorkshopId}.", id);
            throw;
        }
    }
}
