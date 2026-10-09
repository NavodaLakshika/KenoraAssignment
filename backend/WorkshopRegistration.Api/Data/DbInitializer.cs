using Microsoft.EntityFrameworkCore;
using WorkshopRegistration.Api.Models;
using WorkshopRegistration.Api.Services;

namespace WorkshopRegistration.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext db, IAuthService authService)
    {
        // Ensure database schema is created
        await db.Database.EnsureCreatedAsync();

        if (await db.Users.AnyAsync())
        {
            return; // Already seeded
        }

        // 1. Seed Users
        var admin = new User
        {
            FullName = "Eleanor Vance (Admin)",
            Email = "admin@workshop.com",
            PasswordHash = authService.HashPassword("Admin123!"),
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var manager = new User
        {
            FullName = "Mark Robinson (Manager)",
            Email = "manager@workshop.com",
            PasswordHash = authService.HashPassword("Manager123!"),
            Role = "Manager",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var staff = new User
        {
            FullName = "Sarah Jenkins (Staff)",
            Email = "staff@workshop.com",
            PasswordHash = authService.HashPassword("Staff123!"),
            Role = "Staff",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.AddRange(admin, manager, staff);
        await db.SaveChangesAsync();

        // 2. Seed Workshops
        var baseDate = DateTime.UtcNow.Date.AddDays(2);

        var ws1 = new Workshop
        {
            Code = "WS001",
            Title = "Introduction to Pottery & Ceramics",
            Instructor = "Sarah Jenkins",
            Location = "Centre A",
            StartDateTime = baseDate.AddHours(10),
            EndDateTime = baseDate.AddHours(13),
            Capacity = 6,
            Status = "Scheduled",
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var ws2 = new Workshop
        {
            Code = "WS002",
            Title = "Advanced Cloud Architecture",
            Instructor = "Alex Rivera",
            Location = "Centre B",
            StartDateTime = baseDate.AddDays(1).AddHours(14),
            EndDateTime = baseDate.AddDays(1).AddHours(17),
            Capacity = 10,
            Status = "Scheduled",
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var ws3 = new Workshop
        {
            Code = "WS003",
            Title = "Full-Stack React & ASP.NET Core Mastery",
            Instructor = "David Chen",
            Location = "Centre A",
            StartDateTime = baseDate.AddDays(3).AddHours(9),
            EndDateTime = baseDate.AddDays(3).AddHours(16),
            Capacity = 15,
            Status = "Scheduled",
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var ws4 = new Workshop
        {
            Code = "WS004",
            Title = "UX & UI Design Systems in Practice",
            Instructor = "Elena Rostov",
            Location = "Centre C",
            StartDateTime = baseDate.AddDays(5).AddHours(11),
            EndDateTime = baseDate.AddDays(5).AddHours(15),
            Capacity = 8,
            Status = "Scheduled",
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var ws5 = new Workshop
        {
            Code = "WS005",
            Title = "Cybersecurity Incident Response",
            Instructor = "Marcus Vance",
            Location = "Centre B",
            StartDateTime = baseDate.AddDays(-5).AddHours(10),
            EndDateTime = baseDate.AddDays(-5).AddHours(14),
            Capacity = 12,
            Status = "Completed",
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var wsConcurrency = new Workshop
        {
            Code = "WS-CAP1",
            Title = "High-Concurrency Seat Allocation Lab",
            Instructor = "System Stress Engine",
            Location = "Centre C",
            StartDateTime = baseDate.AddDays(7).AddHours(10),
            EndDateTime = baseDate.AddDays(7).AddHours(12),
            Capacity = 1, // Only 1 seat to test strict race condition enforcement!
            Status = "Scheduled",
            CreatedBy = manager.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Workshops.AddRange(ws1, ws2, ws3, ws4, ws5, wsConcurrency);
        await db.SaveChangesAsync();

        // 3. Seed Sample Registrations
        var reg1 = new Registration
        {
            WorkshopId = ws1.Id,
            AttendeeName = "Alice Morgan",
            AttendeeEmail = "alice.morgan@example.com",
            Status = "Active",
            RegisteredBy = staff.Id,
            RegisteredAt = DateTime.UtcNow.AddHours(-12)
        };

        var reg2 = new Registration
        {
            WorkshopId = ws1.Id,
            AttendeeName = "Bob Smith",
            AttendeeEmail = "bob.smith@example.com",
            Status = "Active",
            RegisteredBy = staff.Id,
            RegisteredAt = DateTime.UtcNow.AddHours(-10)
        };

        var regCancelled = new Registration
        {
            WorkshopId = ws1.Id,
            AttendeeName = "Charlie Brown",
            AttendeeEmail = "charlie.brown@example.com",
            Status = "Cancelled",
            RegisteredBy = staff.Id,
            RegisteredAt = DateTime.UtcNow.AddHours(-24),
            CancelledBy = manager.Id,
            CancelledAt = DateTime.UtcNow.AddHours(-4)
        };

        var reg3 = new Registration
        {
            WorkshopId = ws2.Id,
            AttendeeName = "Daniel Craig",
            AttendeeEmail = "daniel.craig@example.com",
            Status = "Active",
            RegisteredBy = manager.Id,
            RegisteredAt = DateTime.UtcNow.AddHours(-8)
        };

        db.Registrations.AddRange(reg1, reg2, regCancelled, reg3);
        await db.SaveChangesAsync();

        // 4. Seed Audit Logs
        db.AuditLogs.AddRange(
            new AuditLog
            {
                UserId = staff.Id,
                Action = "Registered",
                EntityType = "Registration",
                EntityId = reg1.Id,
                Details = "Registered Alice Morgan for Introduction to Pottery & Ceramics.",
                CreatedAt = reg1.RegisteredAt
            },
            new AuditLog
            {
                UserId = staff.Id,
                Action = "Registered",
                EntityType = "Registration",
                EntityId = reg2.Id,
                Details = "Registered Bob Smith for Introduction to Pottery & Ceramics.",
                CreatedAt = reg2.RegisteredAt
            },
            new AuditLog
            {
                UserId = staff.Id,
                Action = "Registered",
                EntityType = "Registration",
                EntityId = regCancelled.Id,
                Details = "Registered Charlie Brown for Introduction to Pottery & Ceramics.",
                CreatedAt = regCancelled.RegisteredAt
            },
            new AuditLog
            {
                UserId = manager.Id,
                Action = "Cancelled",
                EntityType = "Registration",
                EntityId = regCancelled.Id,
                Details = "Cancelled registration for Charlie Brown due to attendee schedule conflict.",
                CreatedAt = regCancelled.CancelledAt!.Value
            }
        );
        await db.SaveChangesAsync();
    }
}
