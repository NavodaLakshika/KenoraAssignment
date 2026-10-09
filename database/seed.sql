-- ==========================================================
-- Workshop Registration Service - Database Seed Script
-- SQL Server 2019 / 2022 / LocalDB
-- ==========================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'WorkshopRegistrationDb')
BEGIN
    CREATE DATABASE WorkshopRegistrationDb;
END
GO

USE WorkshopRegistrationDb;
GO

-- 1. Create Users Table
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(150) NOT NULL,
        Email NVARCHAR(256) NOT NULL,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        Role NVARCHAR(50) NOT NULL, -- 'Admin', 'Manager', 'Staff'
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_Users_Email UNIQUE (Email)
    );
END
GO

-- 2. Create Workshops Table
IF OBJECT_ID('dbo.Workshops', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Workshops (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Instructor NVARCHAR(150) NOT NULL,
        Location NVARCHAR(100) NOT NULL DEFAULT 'Centre A',
        StartDateTime DATETIME2 NOT NULL,
        EndDateTime DATETIME2 NOT NULL,
        Capacity INT NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Scheduled', -- 'Scheduled', 'InProgress', 'Completed', 'Cancelled'
        CreatedBy INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_Workshops_Code UNIQUE (Code),
        CONSTRAINT FK_Workshops_Users FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(Id)
    );
END
GO

-- 3. Create Registrations Table
IF OBJECT_ID('dbo.Registrations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Registrations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        WorkshopId INT NOT NULL,
        AttendeeName NVARCHAR(150) NOT NULL,
        AttendeeEmail NVARCHAR(256) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'Cancelled'
        RegisteredBy INT NOT NULL,
        RegisteredAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CancelledBy INT NULL,
        CancelledAt DATETIME2 NULL,
        CONSTRAINT FK_Registrations_Workshops FOREIGN KEY (WorkshopId) REFERENCES dbo.Workshops(Id),
        CONSTRAINT FK_Registrations_RegisteredBy FOREIGN KEY (RegisteredBy) REFERENCES dbo.Users(Id),
        CONSTRAINT FK_Registrations_CancelledBy FOREIGN KEY (CancelledBy) REFERENCES dbo.Users(Id)
    );

    CREATE NONCLUSTERED INDEX IX_Registrations_WorkshopId_Status 
    ON dbo.Registrations (WorkshopId, Status);
END
GO

-- 4. Create AuditLogs Table
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLogs (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NULL,
        Action NVARCHAR(100) NOT NULL,
        EntityType NVARCHAR(100) NOT NULL,
        EntityId INT NULL,
        Details NVARCHAR(1000) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE SET NULL
    );
END
GO

-- ==========================================================
-- Initial Seed Data
-- Passwords:
-- Admin: admin@workshop.com / Admin123!
-- Manager: manager@workshop.com / Manager123!
-- Staff: staff@workshop.com / Staff123!
-- ==========================================================

-- Seed Users
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = 'admin@workshop.com')
BEGIN
    INSERT INTO dbo.Users (FullName, Email, PasswordHash, Role, IsActive, CreatedAt)
    VALUES 
    ('Eleanor Vance (Admin)', 'admin@workshop.com', '$2a$11$eE0m9Z4sT9v7Vl1bEsmRle0dGhy.xZ33w7.00f9R2jD9fL/o.Z8e2', 'Admin', 1, GETUTCDATE()),
    ('Mark Robinson (Manager)', 'manager@workshop.com', '$2a$11$eE0m9Z4sT9v7Vl1bEsmRle0dGhy.xZ33w7.00f9R2jD9fL/o.Z8e2', 'Manager', 1, GETUTCDATE()),
    ('Sarah Jenkins (Staff)', 'staff@workshop.com', '$2a$11$eE0m9Z4sT9v7Vl1bEsmRle0dGhy.xZ33w7.00f9R2jD9fL/o.Z8e2', 'Staff', 1, GETUTCDATE());
END
GO

-- Seed Workshops
DECLARE @ManagerId INT = (SELECT TOP 1 Id FROM dbo.Users WHERE Role = 'Manager');
IF NOT EXISTS (SELECT 1 FROM dbo.Workshops WHERE Code = 'WS001')
BEGIN
    INSERT INTO dbo.Workshops (Code, Title, Instructor, Location, StartDateTime, EndDateTime, Capacity, Status, CreatedBy, CreatedAt, UpdatedAt)
    VALUES
    ('WS001', 'Introduction to Pottery & Ceramics', 'Sarah Jenkins', 'Centre A', DATEADD(DAY, 2, GETUTCDATE()), DATEADD(DAY, 2, DATEADD(HOUR, 3, GETUTCDATE())), 6, 'Scheduled', @ManagerId, GETUTCDATE(), GETUTCDATE()),
    ('WS002', 'Advanced Cloud Architecture', 'Alex Rivera', 'Centre B', DATEADD(DAY, 3, GETUTCDATE()), DATEADD(DAY, 3, DATEADD(HOUR, 3, GETUTCDATE())), 10, 'Scheduled', @ManagerId, GETUTCDATE(), GETUTCDATE()),
    ('WS003', 'Full-Stack React & ASP.NET Core Mastery', 'David Chen', 'Centre A', DATEADD(DAY, 5, GETUTCDATE()), DATEADD(DAY, 5, DATEADD(HOUR, 6, GETUTCDATE())), 15, 'Scheduled', @ManagerId, GETUTCDATE(), GETUTCDATE()),
    ('WS004', 'UX & UI Design Systems in Practice', 'Elena Rostov', 'Centre C', DATEADD(DAY, 7, GETUTCDATE()), DATEADD(DAY, 7, DATEADD(HOUR, 4, GETUTCDATE())), 8, 'Scheduled', @ManagerId, GETUTCDATE(), GETUTCDATE()),
    ('WS005', 'Cybersecurity Incident Response', 'Marcus Vance', 'Centre B', DATEADD(DAY, -5, GETUTCDATE()), DATEADD(DAY, -5, DATEADD(HOUR, 4, GETUTCDATE())), 12, 'Completed', @ManagerId, GETUTCDATE(), GETUTCDATE()),
    ('WS-CAP1', 'High-Concurrency Seat Allocation Lab', 'System Stress Engine', 'Centre C', DATEADD(DAY, 10, GETUTCDATE()), DATEADD(DAY, 10, DATEADD(HOUR, 2, GETUTCDATE())), 1, 'Scheduled', @ManagerId, GETUTCDATE(), GETUTCDATE());
END
GO

-- Seed Registrations & Audit Logs
DECLARE @Ws1Id INT = (SELECT TOP 1 Id FROM dbo.Workshops WHERE Code = 'WS001');
DECLARE @StaffId INT = (SELECT TOP 1 Id FROM dbo.Users WHERE Role = 'Staff');
DECLARE @MgrId INT = (SELECT TOP 1 Id FROM dbo.Users WHERE Role = 'Manager');

IF NOT EXISTS (SELECT 1 FROM dbo.Registrations WHERE WorkshopId = @Ws1Id)
BEGIN
    INSERT INTO dbo.Registrations (WorkshopId, AttendeeName, AttendeeEmail, Status, RegisteredBy, RegisteredAt, CancelledBy, CancelledAt)
    VALUES
    (@Ws1Id, 'Alice Morgan', 'alice.morgan@example.com', 'Active', @StaffId, DATEADD(HOUR, -12, GETUTCDATE()), NULL, NULL),
    (@Ws1Id, 'Bob Smith', 'bob.smith@example.com', 'Active', @StaffId, DATEADD(HOUR, -10, GETUTCDATE()), NULL, NULL),
    (@Ws1Id, 'Charlie Brown', 'charlie.brown@example.com', 'Cancelled', @StaffId, DATEADD(HOUR, -24, GETUTCDATE()), @MgrId, DATEADD(HOUR, -4, GETUTCDATE()));

    INSERT INTO dbo.AuditLogs (UserId, Action, EntityType, EntityId, Details, CreatedAt)
    VALUES
    (@StaffId, 'Registered', 'Registration', 1, 'Registered Alice Morgan for Introduction to Pottery & Ceramics.', DATEADD(HOUR, -12, GETUTCDATE())),
    (@StaffId, 'Registered', 'Registration', 2, 'Registered Bob Smith for Introduction to Pottery & Ceramics.', DATEADD(HOUR, -10, GETUTCDATE())),
    (@StaffId, 'Registered', 'Registration', 3, 'Registered Charlie Brown for Introduction to Pottery & Ceramics.', DATEADD(HOUR, -24, GETUTCDATE())),
    (@MgrId, 'Cancelled', 'Registration', 3, 'Cancelled registration for Charlie Brown due to attendee schedule conflict.', DATEADD(HOUR, -4, GETUTCDATE()));
END
GO
