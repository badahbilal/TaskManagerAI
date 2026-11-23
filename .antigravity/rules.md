# Project Constitution & Coding Standards

## 1. General & Architecture (.NET 10)
- **Clean Architecture:** Strictly respect layer boundaries (`Domain` -> `Application` -> `Infrastructure` -> `API`). Never reference `Infrastructure` or `API` inside `Domain` or `Application`.
- **SOLID Principles:** Every class/service must have a single responsibility. Depend on interfaces (`Abstractions`), not concrete implementations.
- **Explicit Typing (CRITICAL):** NEVER use `var` in C#. Always declare explicit types (e.g., `TaskItem task = new TaskItem();` or `List<TaskDto> tasks = ...`) for maximum readability during code reviews.

## 2. Frontend (React + TypeScript)
- Use Functional Components with TypeScript interfaces for all props and API responses.
- Keep API calls separated in a `services/` folder; never call `fetch` or `axios` directly inside UI components.
- Keep UI clean, simple, and well-typed.

## 3. Agent Verification Workflow
- After modifying any backend C# file, ALWAYS run `dotnet build` inside the `backend/` folder to verify zero compilation errors before finishing your turn.
- After modifying any frontend file, run `npm run build` inside `frontend/` to ensure TypeScript types match.