using Microsoft.EntityFrameworkCore;
using WorkshopRegistration.Api.Models;

namespace WorkshopRegistration.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Workshop> Workshops => Set<Workshop>();
    public DbSet<Registration> Registrations => Set<Registration>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // Workshop
        modelBuilder.Entity<Workshop>(entity =>
        {
            entity.HasIndex(w => w.Code).IsUnique();
            entity.HasOne(w => w.Creator)
                  .WithMany()
                  .HasForeignKey(w => w.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Registration
        modelBuilder.Entity<Registration>(entity =>
        {
            entity.HasIndex(r => new { r.WorkshopId, r.Status });

            entity.HasOne(r => r.Workshop)
                  .WithMany(w => w.Registrations)
                  .HasForeignKey(r => r.WorkshopId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.RegisteredByUser)
                  .WithMany()
                  .HasForeignKey(r => r.RegisteredBy)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.CancelledByUser)
                  .WithMany()
                  .HasForeignKey(r => r.CancelledBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // AuditLog
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasOne(a => a.User)
                  .WithMany()
                  .HasForeignKey(a => a.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
