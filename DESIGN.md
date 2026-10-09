# Workshop Registration Service — Design Decisions

## Technology Stack

The application uses **React with Vite** for the frontend, **ASP.NET Core Web API (.NET 8)** for backend services, and **Microsoft SQL Server** for persistent data storage. This stack provides a clean separation of concerns between user interface presentation, robust business rules, dependency injection architecture, and database persistence.

- **Frontend**: React 18, Vite, React Router DOM, Axios, Lucide Icons, and Vanilla CSS with a modern dark glassmorphism design system.
- **Backend**: ASP.NET Core 8 Web API, Entity Framework Core 8, Microsoft SQL Server Provider, JWT Bearer Authentication, and BCrypt password hashing.
- **Architecture**: Inversion of Control via Dependency Injection (`IAuthService`, `IWorkshopService`, `IRegistrationService`, `IUserService`), structured logging with `ILogger<T>`, and explicit `try-catch` blocks and global exception middleware.

## Architecture and Access Control

The backend exposes RESTful API endpoints organized by business capability:
- Authentication (`/api/auth`)
- User Management (`/api/users`)
- Workshop Management (`/api/workshops`)
- Registration Management (`/api/registrations`)

Security is enforced using JWT Bearer tokens and ASP.NET Core `[Authorize(Roles = "...")]` attributes:
1. **Admin**: Authorized only to create Staff/Manager accounts and view user lists. Blocked from creating workshops or registering attendees.
2. **Manager**: Authorized to create and modify workshops, register attendees, and cancel registrations. Blocked from managing users.
3. **Staff**: Authorized to view workshops, register attendees, and cancel registrations. Blocked from creating/editing workshops and managing users.
4. **Public / Unauthenticated**: Permanently blocked with `401 Unauthorized`. Public self-registration is disabled; the initial Admin account is provisioned via the seed script.

## Data Model

The database contains four primary tables:
- **`Users`**: Stores credentials, role (`Admin`, `Manager`, `Staff`), activity status, and timestamps. Passwords are cryptographically hashed using BCrypt.
- **`Workshops`**: Stores workshop scheduling metadata, instructor, location, capacity, status (`Scheduled`, `InProgress`, `Completed`, `Cancelled`), and foreign key to the creating user. Workshop code has a unique constraint.
- **`Registrations`**: Records attendee name, email, foreign key to workshop, registration status (`Active`, `Cancelled`), registering staff user reference (`RegisteredBy`), cancellation actor (`CancelledBy`), and respective UTC timestamps.
- **`AuditLogs`**: Preserves an immutable historical event trail for capacity actions and cancellations.

**Cancelled registrations are never deleted from the database**. When an attendee cancels, `Status` is set to `Cancelled`, `CancelledBy` and `CancelledAt` are stamped, freeing the capacity while preserving full audit history.

## Preventing Over-Registration (Concurrency Control)

The critical business invariant is:
$$\text{Active Registrations} \le \text{Workshop Capacity}$$

A naive `CountAsync` followed by `Add` creates a race condition where simultaneous requests read the same remaining seat and both insert. To eliminate this:
1. An explicit database transaction (`BeginTransactionAsync`) is opened.
2. An update lock (`WITH (UPDLOCK, ROWLOCK, HOLDLOCK)`) is acquired on the specific workshop row.
3. Competing registration attempts for the same workshop are serialized at the database row level without blocking operations on other workshops.
4. Active registrations are counted under the exclusive lock. If active count equals or exceeds capacity, the transaction rolls back and returns HTTP `409 Conflict`.
5. Only when capacity is strictly available is the registration record inserted and the transaction committed.

A dedicated multi-threaded concurrency stress test (`tests/ConcurrencyTest.cs`) verified that firing 10 simultaneous asynchronous requests for a workshop with 1 seat resulted in exactly 1 successful registration (`201 Created`) and 9 rejected attempts (`409 Conflict`), with zero overbooking.

## Trade-offs and Assumptions

- **Attendee Accounts**: Attendees do not create accounts; staff members register them on their behalf using name and email.
- **Locations**: The training centre operates across three fixed locations (`Centre A`, `Centre B`, `Centre C`).
- **Waitlists**: An automated waitlist was deferred to prioritize rock-solid transactional capacity locking and role authorization within the 3-hour window.

## Testing and Verification

The system was verified with automated test suites covering:
1. Role-based permission enforcement (Admin, Manager, Staff restrictions).
2. Public registration prevention and unauthenticated request rejection.
3. Live multi-threaded concurrency safety against Microsoft SQL Server.
4. Cancellation seat release and registration history retention.
5. Multi-parameter workshop search, date ranges, and availability filtering.
