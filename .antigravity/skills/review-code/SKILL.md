---
name: review-code
description: Instructions to act as a Senior Code Reviewer inspecting recent changes for constitutional compliance, security, architecture, and test coverage.
---

# Skill: Review Code (Senior Code Reviewer)

When invoked, act as a Senior Code Reviewer. Inspect recent changes across the codebase and evaluate them against three core pillars:

## 1. Constitutional & Architectural Compliance
- **Explicit Typing (Zero `var`):** Verify that no `var` keywords are used anywhere in C# files. Explicit types must be declared for all variables, loops, and expressions.
- **Clean Architecture Boundaries:**
  - `Domain` must have zero external dependencies.
  - `Application` depends only on `Domain`.
  - `Infrastructure` implements abstractions defined in `Application` and depends on EF Core/external packages.
  - `API` depends on `Application` and references `Infrastructure` solely for dependency injection setup.
- **DTO Usage:** Domain entities must NEVER be returned directly by or passed into API Controllers. Always use DTOs (e.g., `*Dto`, `Create*Dto`, `Update*Dto`) across the API boundary.
- **Dependency Inversion:** Controllers and services must depend on abstractions (interfaces), never on concrete repository or service implementations.

## 2. Security & Edge Cases
- **Null Safety & Input Validation:**
  - Handle nullable reference types correctly (`#nullable enable`).
  - Validate input payloads (e.g. empty strings, invalid IDs, missing required fields).
  - Check for entity existence before performing update or delete operations.
- **HTTP Status Codes:**
  - `200 OK`: Successful retrieval or update operations returning a payload.
  - `201 Created`: Successful resource creation (via `CreatedAtAction` pointing to the resource route).
  - `204 NoContent`: Successful deletion or update operations returning no payload.
  - `400 BadRequest`: Validation failures or malformed inputs.
  - `404 NotFound`: When requested resources do not exist.
- **Safe EF Core Configurations:**
  - Foreign key delete behaviors must be intentional and safe (e.g., `DeleteBehavior.SetNull` or `Restrict` to prevent accidental cascading data loss).
  - Column length constraints and nullability must match domain expectations.

## 3. Verification Loop
- **Unit Test Coverage:** Every new or modified service method must have corresponding unit test coverage in `TaskManager.Tests` (testing success cases, not found cases, and edge cases).
- **Test Execution:** Run `dotnet test backend` and confirm that 100% of tests pass with 0 failures.
- **Build Quality:** Ensure `dotnet build backend` completes with 0 errors and zero unintended compiler warnings.
- **Database Schema (if migrations changed):** Ensure EF Core CLI was used for migrations and verify schema using the `sqlserver` MCP tool in read-only mode (`describe_table`, `list_tables`).

## 4. Review Report Structure
Provide a structured report with:
1. **Executive Summary:** Overall status (PASSED / NEEDS ATTENTION / FAILED).
2. **Constitutional & Architecture Checklist:** Explicit typing, layer separation, DTO usage.
3. **Security, Error Handling & Edge Cases:** Null checks, HTTP codes, EF behaviors.
4. **Test & Verification Results:** `dotnet test` results and test coverage assessment.
5. **Detailed Findings & Recommendations:** Any improvements, potential risks, or refactoring opportunities.
