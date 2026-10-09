using System.Data;
using Microsoft.EntityFrameworkCore;
using WorkshopRegistration.Api.Data;
using WorkshopRegistration.Api.DTOs;
using WorkshopRegistration.Api.Models;

namespace WorkshopRegistration.Api.Services;

public class RegistrationService : IRegistrationService
{
    private readonly AppDbContext _db;
    private readonly ILogger<RegistrationService> _logger;

    public RegistrationService(AppDbContext db, ILogger<RegistrationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<RegistrationResult> RegisterAttendeeAsync(CreateRegistrationDto dto, int userId)
    {
        _logger.LogInformation("Staff {UserId} initiating registration for attendee {AttendeeEmail} in workshop {WorkshopId}.", 
            userId, dto.AttendeeEmail, dto.WorkshopId);

        // Begin transaction with update lock to strictly prevent concurrent overbooking
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

        try
        {
            // Lock the specific workshop row exclusively for this transaction
            var workshop = await _db.Workshops
                .FromSqlInterpolated($"SELECT * FROM Workshops WITH (UPDLOCK, ROWLOCK, HOLDLOCK) WHERE Id = {dto.WorkshopId}")
                .SingleOrDefaultAsync();

            if (workshop == null)
            {
                _logger.LogWarning("Registration failed: Workshop ID {WorkshopId} not found.", dto.WorkshopId);
                await transaction.RollbackAsync();
                return new RegistrationResult
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Workshop not found."
                };
            }

            if (!string.Equals(workshop.Status, "Scheduled", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Registration failed: Workshop {WorkshopId} status is '{Status}', not Scheduled.", 
                    dto.WorkshopId, workshop.Status);
                await transaction.RollbackAsync();
                return new RegistrationResult
                {
                    Success = false,
                    StatusCode = 400,
                    Message = $"Cannot register for a workshop that is {workshop.Status}."
                };
            }

            // Check if attendee is already actively registered
            var alreadyRegistered = await _db.Registrations
                .AnyAsync(r => r.WorkshopId == dto.WorkshopId &&
                               r.Status == "Active" &&
                               r.AttendeeEmail.ToLower() == dto.AttendeeEmail.Trim().ToLower());

            if (alreadyRegistered)
            {
                _logger.LogWarning("Registration failed: Attendee {Email} is already active in workshop {WorkshopId}.", 
                    dto.AttendeeEmail, dto.WorkshopId);
                await transaction.RollbackAsync();
                return new RegistrationResult
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "This attendee is already actively registered for this workshop."
                };
            }

            // Count active registrations under the lock
            var activeCount = await _db.Registrations
                .CountAsync(r => r.WorkshopId == dto.WorkshopId && r.Status == "Active");

            if (activeCount >= workshop.Capacity)
            {
                _logger.LogWarning("Registration rejected: Workshop {WorkshopId} reached full capacity ({Active}/{Capacity}).", 
                    dto.WorkshopId, activeCount, workshop.Capacity);
                await transaction.RollbackAsync();
                return new RegistrationResult
                {
                    Success = false,
                    StatusCode = 409,
                    Message = "This workshop is full. Capacity has been reached."
                };
            }

            var registration = new Registration
            {
                WorkshopId = dto.WorkshopId,
                AttendeeName = dto.AttendeeName.Trim(),
                AttendeeEmail = dto.AttendeeEmail.Trim().ToLower(),
                Status = "Active",
                RegisteredBy = userId,
                RegisteredAt = DateTime.UtcNow
            };

            _db.Registrations.Add(registration);
            await _db.SaveChangesAsync();

            // Log to AuditTrail
            _db.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                Action = "Registered",
                EntityType = "Registration",
                EntityId = registration.Id,
                Details = $"Registered '{registration.AttendeeName}' ({registration.AttendeeEmail}) for workshop '{workshop.Title}' ({workshop.Code}). Seat {activeCount + 1}/{workshop.Capacity}.",
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            _logger.LogInformation("Registration successful. ID: {RegId}, Workshop: {WorkshopId}, Seat: {Seat}/{Capacity}", 
                registration.Id, workshop.Id, activeCount + 1, workshop.Capacity);

            var registeringUser = await _db.Users.FindAsync(userId);

            return new RegistrationResult
            {
                Success = true,
                StatusCode = 201,
                Message = "Registration successful.",
                Registration = new RegistrationDto
                {
                    Id = registration.Id,
                    WorkshopId = workshop.Id,
                    WorkshopCode = workshop.Code,
                    WorkshopTitle = workshop.Title,
                    AttendeeName = registration.AttendeeName,
                    AttendeeEmail = registration.AttendeeEmail,
                    Status = registration.Status,
                    RegisteredBy = userId,
                    RegisteredByName = registeringUser?.FullName ?? "Unknown",
                    RegisteredAt = registration.RegisteredAt
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Transaction exception during registration for workshop {WorkshopId}.", dto.WorkshopId);
            await transaction.RollbackAsync();
            return new RegistrationResult
            {
                Success = false,
                StatusCode = 500,
                Message = $"An error occurred during registration: {ex.Message}"
            };
        }
    }

    public async Task<CancellationResult> CancelRegistrationAsync(int registrationId, int userId)
    {
        _logger.LogInformation("User {UserId} requesting cancellation for registration {RegistrationId}.", userId, registrationId);

        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

        try
        {
            var reg = await _db.Registrations
                .FromSqlInterpolated($"SELECT * FROM Registrations WITH (UPDLOCK, ROWLOCK, HOLDLOCK) WHERE Id = {registrationId}")
                .Include(r => r.Workshop)
                .SingleOrDefaultAsync();

            if (reg == null)
            {
                _logger.LogWarning("Cancellation failed: Registration {RegistrationId} not found.", registrationId);
                await transaction.RollbackAsync();
                return new CancellationResult
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Registration not found."
                };
            }

            if (string.Equals(reg.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Cancellation failed: Registration {RegistrationId} was already cancelled.", registrationId);
                await transaction.RollbackAsync();
                return new CancellationResult
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "This registration has already been cancelled."
                };
            }

            reg.Status = "Cancelled";
            reg.CancelledBy = userId;
            reg.CancelledAt = DateTime.UtcNow;

            _db.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                Action = "Cancelled",
                EntityType = "Registration",
                EntityId = reg.Id,
                Details = $"Cancelled registration for '{reg.AttendeeName}' in workshop '{reg.Workshop?.Title}' ({reg.Workshop?.Code}).",
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Registration {RegistrationId} cancelled successfully by user {UserId}.", registrationId, userId);

            var cancellingUser = await _db.Users.FindAsync(userId);
            var registeringUser = await _db.Users.FindAsync(reg.RegisteredBy);

            return new CancellationResult
            {
                Success = true,
                StatusCode = 200,
                Message = "Registration cancelled successfully.",
                Registration = new RegistrationDto
                {
                    Id = reg.Id,
                    WorkshopId = reg.WorkshopId,
                    WorkshopCode = reg.Workshop?.Code ?? string.Empty,
                    WorkshopTitle = reg.Workshop?.Title ?? string.Empty,
                    AttendeeName = reg.AttendeeName,
                    AttendeeEmail = reg.AttendeeEmail,
                    Status = reg.Status,
                    RegisteredBy = reg.RegisteredBy,
                    RegisteredByName = registeringUser?.FullName ?? "Unknown",
                    RegisteredAt = reg.RegisteredAt,
                    CancelledBy = reg.CancelledBy,
                    CancelledByName = cancellingUser?.FullName,
                    CancelledAt = reg.CancelledAt
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Transaction exception during cancellation of registration {RegistrationId}.", registrationId);
            await transaction.RollbackAsync();
            return new CancellationResult
            {
                Success = false,
                StatusCode = 500,
                Message = $"An error occurred during cancellation: {ex.Message}"
            };
        }
    }

    public async Task<List<RegistrationDto>> GetRegistrationsAsync(int? workshopId = null, string? status = null)
    {
        try
        {
            _logger.LogInformation("Fetching registrations (workshopId: {WorkshopId}, status: {Status})", workshopId, status);

            var query = _db.Registrations
                .Include(r => r.Workshop)
                .Include(r => r.RegisteredByUser)
                .Include(r => r.CancelledByUser)
                .AsNoTracking()
                .AsQueryable();

            if (workshopId.HasValue)
            {
                query = query.Where(r => r.WorkshopId == workshopId.Value);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(r => r.Status == status);
            }

            return await query
                .OrderByDescending(r => r.RegisteredAt)
                .Select(r => new RegistrationDto
                {
                    Id = r.Id,
                    WorkshopId = r.WorkshopId,
                    WorkshopCode = r.Workshop != null ? r.Workshop.Code : string.Empty,
                    WorkshopTitle = r.Workshop != null ? r.Workshop.Title : string.Empty,
                    AttendeeName = r.AttendeeName,
                    AttendeeEmail = r.AttendeeEmail,
                    Status = r.Status,
                    RegisteredBy = r.RegisteredBy,
                    RegisteredByName = r.RegisteredByUser != null ? r.RegisteredByUser.FullName : "Unknown",
                    RegisteredAt = r.RegisteredAt,
                    CancelledBy = r.CancelledBy,
                    CancelledByName = r.CancelledByUser != null ? r.CancelledByUser.FullName : null,
                    CancelledAt = r.CancelledAt
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching registrations.");
            throw;
        }
    }

    public async Task<RegistrationHistoryDto?> GetRegistrationHistoryAsync(int registrationId)
    {
        try
        {
            _logger.LogInformation("Fetching registration history for ID {RegistrationId}", registrationId);

            var reg = await _db.Registrations
                .Include(r => r.Workshop)
                .Include(r => r.RegisteredByUser)
                .Include(r => r.CancelledByUser)
                .AsNoTracking()
                .SingleOrDefaultAsync(r => r.Id == registrationId);

            if (reg == null)
            {
                _logger.LogWarning("Registration history not found for ID {RegistrationId}", registrationId);
                return null;
            }

            var auditTrail = await _db.AuditLogs
                .Include(a => a.User)
                .Where(a => a.EntityType == "Registration" && a.EntityId == registrationId)
                .OrderBy(a => a.CreatedAt)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    UserName = a.User != null ? a.User.FullName : "System",
                    Action = a.Action,
                    EntityType = a.EntityType,
                    EntityId = a.EntityId,
                    Details = a.Details,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return new RegistrationHistoryDto
            {
                Id = reg.Id,
                WorkshopId = reg.WorkshopId,
                WorkshopCode = reg.Workshop?.Code ?? string.Empty,
                WorkshopTitle = reg.Workshop?.Title ?? string.Empty,
                AttendeeName = reg.AttendeeName,
                AttendeeEmail = reg.AttendeeEmail,
                Status = reg.Status,
                RegisteredBy = reg.RegisteredBy,
                RegisteredByName = reg.RegisteredByUser?.FullName ?? "Unknown",
                RegisteredAt = reg.RegisteredAt,
                CancelledBy = reg.CancelledBy,
                CancelledByName = reg.CancelledByUser?.FullName,
                CancelledAt = reg.CancelledAt,
                AuditTrail = auditTrail
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving registration history for {RegistrationId}", registrationId);
            throw;
        }
    }
}
