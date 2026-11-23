---
name: create-frontend-feature
description: Guide and standard operating procedure for implementing frontend features in React + TypeScript with strict typing and backend contract alignment.
---

# Skill: Create Frontend Feature

When implementing or updating a frontend feature in `frontend/`, follow these sequential steps:

## 1. Inspect Backend API Contracts
- Read relevant backend Controllers in `backend/TaskManager.API/Controllers/` to identify all route paths, HTTP methods, route parameters, query strings, and expected HTTP response codes.
- Read all related DTO files in `backend/TaskManager.Application/DTOs/` to identify exact field names, casing, types, and nullability.
- Ensure 100% alignment between backend C# contracts and frontend TypeScript types.

## 2. Strict TypeScript Typing (Zero `any`)
- Declare strongly typed interfaces and types in `src/types/` representing:
  - Entity DTOs (e.g. `TaskDto`, `CategoryDto`)
  - Request payloads (`Create*Dto`, `Update*Dto`)
  - UI state and filter types
- **NO `any` KEYWORD:** Never use `any` anywhere in frontend code. Use proper generics, union types, or `unknown` with type guards if dealing with arbitrary external inputs.

## 3. Dedicated API Services
- Keep API interactions isolated in `src/services/` (e.g., `taskService.ts`, `categoryService.ts`).
- Never perform raw `fetch` or HTTP calls directly inside React components.
- Use consistent error handling and propagate typed responses or clear error messages.
- Centralize API base URL configuration.

## 4. Component Architecture & UI/UX
- Build clean, accessible, and responsive components in `src/components/` and `src/App.tsx`.
- Keep component props typed with TypeScript `interface` or `type`.
- Provide smooth feedback for loading, empty, and error states.

## 5. Verification Loop
- Check for any lingering `any` usages across `frontend/src`.
- Run `npm run build` inside `frontend/` to ensure TypeScript compilation (`tsc`) and Vite bundle build succeed with zero errors.
