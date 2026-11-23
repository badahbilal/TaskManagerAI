---
name: create-backend-feature
description: Step-by-step skill to add a new Vertical Slice feature in .NET 10 Clean Architecture
---

# Skill: Create Backend Feature

When asked to create a new backend feature (e.g., Tasks, Categories), execute these steps in exact order:

1. **Domain Layer (`TaskManager.Domain`):**
   - Create or update the Entity class inside `Entities/`.
   - Ensure strict encapsulation and explicit types (NO `var`).

2. **Application Layer (`TaskManager.Application`):**
   - Define the Repository interface inside `Interfaces/` (e.g., `ITaskRepository`).
   - Create DTOs (Records or Classes) inside `DTOs/`.
   - Create the Service interface and implementation inside `Services/` applying SOLID principles.

3. **Infrastructure Layer (`TaskManager.Infrastructure`):**
   - Implement the Repository interface using `DbContext`.
   - Register the Repository and Service in Dependency Injection.
   - For any schema change, use EF Core CLI (`dotnet ef migrations add` and `dotnet ef database update`). Never apply DDL through MCP tools.

4. **API Layer (`TaskManager.API`):**
   - Create a clean Controller or Minimal API endpoints delegating work to the Application Service.

5. **Testing & Verification:**
   - Write comprehensive unit tests in `TaskManager.Tests` for all application service methods and business logic (strictly explicit types, NO `var`).
   - Run `dotnet build` inside `backend/` to verify zero compilation errors.
   - Run `dotnet test` inside `backend/` to verify all tests pass with 0 failures.
   - Use the `sqlserver` MCP tool in read-only mode (`list_tables`, `describe_table`) to verify database schema changes.
