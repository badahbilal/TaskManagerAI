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

4. **API Layer (`TaskManager.API`):**
   - Create a clean Controller or Minimal API endpoints delegating work to the Application Service.

5. **Verification:**
   - Run `dotnet build` inside `backend/` to verify everything compiles cleanly.
