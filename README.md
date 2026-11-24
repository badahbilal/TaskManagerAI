# TaskManagerAI 🚀

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Render-Hosted%20(Production)-46E3B7?logo=render&logoColor=white)](https://render.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Hosted%20(Frontend)-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)
[![Neon](https://img.shields.io/badge/Neon-Serverless%20Postgres-00E599?logo=neon&logoColor=black)](https://neon.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, production-ready Full-Stack SaaS productivity application built with **.NET 10 Clean Architecture**, **PostgreSQL**, and **React 19 + TypeScript**. Featuring a sleek **Linear- and Todoist-inspired UI**, date-based planning (`Today`, `Upcoming`, and Read-Only `History Archive`), automatic daily recurring task synchronization, JWT user authentication with data isolation, and a comprehensive cloud deployment pipeline.

---

## 🌐 Live Deployments

Experience the live application deployed across continuous cloud environments:

- **🚀 Live Production App (Permanent — Netlify + Render Free Tier):**  
  **[https://taskmanager-ai-pro.netlify.app/](https://taskmanager-ai-pro.netlify.app/)**  
  *(Note: Free backend instance spins down after 15 minutes of inactivity and wakes up in ~30–45 seconds on the first request).*

- **🧪 Staging / Trial Environment (Temporary 30-Day Trial — Netlify + Railway):**  
  **[https://taskmanagerai-badah.netlify.app/](https://taskmanagerai-badah.netlify.app/)**  
  *(Fast always-on trial instance; automatically pauses once the 30-day / $5 trial credit expires).*

---

## 📖 Table of Contents

- [🌐 Live Deployments](#-live-deployments)
- [1. Project Overview & The AI-Assisted Engineering Story](#1-project-overview--the-ai-assisted-engineering-story)
  - [The AI Agent Workflow](#the-ai-agent-workflow)
  - [Specialized Skills & Strict Constitution](#specialized-skills--strict-constitution)
- [2. Key Features & Architecture](#2-key-features--architecture)
  - [Backend Architecture (.NET 10 Clean Architecture)](#backend-architecture-net-10-clean-architecture)
  - [Business Rules & Date-Based Task Planning](#business-rules--date-based-task-planning)
  - [Frontend Architecture (React 19 + TypeScript)](#frontend-architecture-react-19--typescript)
- [3. Repository Structure](#3-repository-structure)
- [4. Local Setup & Installation Guide](#4-local-setup--installation-guide)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (.NET 10)](#backend-setup-net-10)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
  - [Running Tests](#running-tests)
- [5. Cloud Deployment Architecture & Hosting Comparison](#5-cloud-deployment-architecture--hosting-comparison)
  - [Hosting Platforms Overview](#hosting-platforms-overview)
  - [Platform Comparison Matrix](#platform-comparison-matrix)
  - [Docker Containerization](#docker-containerization)
- [6. Contributing & Constitution](#6-contributing--constitution)
- [7. License](#7-license)

---

## 1. Project Overview & The AI-Assisted Engineering Story

**TaskManagerAI** originated as an experimental, hands-on exploration of **autonomous AI-assisted software engineering** powered by **Google Antigravity**. 

Rather than treating the AI as an informal code generator, this project was architected around a disciplined paradigm: combining a **strict software constitution**, **autonomous agent loops**, **Model Context Protocol (MCP)** live tools, and specialized **reusable engineering skills**.

```
                           ┌────────────────────────────────────────┐
                           │          Google Antigravity            │
                           │           (AI Coding Agent)            │
                           └──────────────────┬─────────────────────┘
                                              │
              ┌───────────────────────────────┼──────────────────────────────┐
              ▼                               ▼                              ▼
  ┌──────────────────────┐        ┌──────────────────────┐       ┌──────────────────────┐
  │ Project Constitution │        │ Specialized Skills   │       │   MCP Tooling        │
  │ (.antigravity/rules) │        │ (.antigravity/skills)│       │ (DB Verification)    │
  │                      │        │                      │       │                      │
  │ • Clean Architecture │        │ • Backend Feature    │       │ • PostgreSQL Schema  │
  │ • Zero 'var' (C#)    │        │ • Frontend Feature   │       │ • Migration Audit    │
  │ • Zero 'any' (TS)    │        │ • Senior Code Review │       │ • Data Verification  │
  │ • 100% Tests Passing │        │                      │       │                      │
  └──────────────────────┘        └──────────────────────┘       └──────────────────────┘
              │                               │                              │
              └───────────────────────────────┼──────────────────────────────┘
                                              │
                                              ▼
                         ┌─────────────────────────────────────────┐
                         │ Fully Tested Production SaaS Application│
                         │ (.NET 10 + React 19 + Neon + Render)    │
                         └─────────────────────────────────────────┘
```

### The AI Agent Workflow

1. **Constitutional Enforcement:** The project repository contains a constitution (`.antigravity/rules.md`) that enforces non-negotiable rules across all changes:
   - **Strict Explicit Typing:** The `var` keyword is strictly prohibited in C# to maximize clarity during architectural review. The `any` keyword is strictly forbidden in TypeScript.
   - **Clean Architecture Boundaries:** Pure Domain entities never reference Infrastructure or API frameworks.
   - **Automated Verification Loop:** Every single code change requires running `dotnet build`, `dotnet test` (maintaining 100% pass rate across 46+ tests), and `npm run build` before completing a turn.
2. **Model Context Protocol (MCP):** Live database schema inspection was integrated directly into the agent workflow, allowing safe schema verification and migration sanity checks against the target database.
3. **Specialized Agent Skills:**
   - [`create-backend-feature`](.antigravity/skills/create-backend-feature/SKILL.md): Orchestrates full vertical slices (Domain entity -> Application DTOs & Service -> Infrastructure EF Core configuration & Repository -> API Controller -> xUnit tests).
   - [`create-frontend-feature`](.antigravity/skills/create-frontend-feature/SKILL.md): Enforces 100% contract alignment between backend DTOs and TypeScript interfaces.
   - [`review-code`](.antigravity/skills/review-code/SKILL.md): Acts as an independent automated Senior Code Reviewer auditing architectural separation, security headers, proper status codes, and test coverage.

What started as an agent sandbox evolved into a robust, cloud-deployed, enterprise-grade task management system.

---

## 2. Key Features & Architecture

### Backend Architecture (.NET 10 Clean Architecture)

The backend is built with **C# 14** on **.NET 10**, structured strictly following **Clean Architecture** and SOLID principles:

```
backend/
├── TaskManager.Domain/          # Pure entities: TaskItem, Category, User (Zero dependencies)
├── TaskManager.Application/     # Interfaces, DTOs, Business Logic (TaskService, CategoryService)
├── TaskManager.Infrastructure/  # EF Core, PostgreSQL (Npgsql), PBKDF2 PasswordHasher, JwtService
├── TaskManager.API/             # Controllers, Auth, Middleware, Auto-Migrations, OpenAPI
└── TaskManager.Tests/           # 46+ xUnit tests with Moq (100% pass rate)
```

- **Authentication & Data Isolation:**
  - Secure registration and login via `POST /api/auth/register` and `POST /api/auth/login`.
  - Passwords salted and hashed with **PBKDF2** (`Rfc2898DeriveBytes` with HMAC-SHA256, 100,000 iterations).
  - Stateless **JWT Bearer Authentication** with cryptographic signature validation.
  - Claims-based user scoping: Every repository query automatically isolates records by `UserId`. Users can never view, update, or delete another user's tasks or categories.
- **Database Persistence & Compatibility:**
  - Powered by **Entity Framework Core 10** with **Npgsql.EntityFrameworkCore.PostgreSQL**.
  - Intelligent connection string parser (`ParseConnectionString`) that handles both standard Npgsql formats and Cloud URI formats (`postgres://user:pass@host:port/db`) from providers like Neon, Render, Supabase, and Railway.
  - **Automatic Startup Migrations:** On application startup, pending EF Core migrations are automatically applied via `dbContext.Database.Migrate()`, eliminating manual migration steps during cloud deployment.

### Business Rules & Date-Based Task Planning

TaskManagerAI features a sophisticated date-based planning and archive system enforced directly in `TaskService`:

```
                 ┌─────────────────────────────────────────────────────────────┐
                 │                Date-Based Task Lifecycle                    │
                 └──────────────────────────────┬──────────────────────────────┘
                                                │
         ┌──────────────────────────────┬───────┴──────────────────────┬──────────────────────────────┐
         ▼                              ▼                              ▼                              ▼
┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
│ Past Dates      │            │ Today           │            │ Upcoming Future │            │ Daily Recurring │
│ (History)       │            │ (Active Focus)  │            │ (Planning)      │            │ (Recurrence)    │
├─────────────────┤            ├─────────────────┤            ├─────────────────┤            ├─────────────────┤
│ • Read-Only     │            │ • Full CRUD     │            │ • Create        │            │ • Marked IsDaily│
│ • Edits blocked │            │ • Toggle Done   │            │ • Edit / Delete │            │ • Auto-spawns   │
│ • Deletes 400   │            │ • Sets Completed│            │ • Completion    │            │   fresh instance│
│ • Completed vs  │            │   timestamp     │            │   LOCKED until  │            │   each morning  │
│   Missed badges │            │ • Syncs Daily   │            │   due date      │            │   for Today     │
└─────────────────┘            └─────────────────┘            └─────────────────┘            └─────────────────┘
```

1. **Today View (`DueDate == Today`):**
   - Full permissions: create, update, delete, and toggle `IsCompleted`.
   - Marking completed automatically stamps `CompletedAt = DateTime.UtcNow`.
   - Fetching today's tasks triggers the **Daily Recurrence Engine**, automatically spawning new instances for any existing `IsDaily` templates owned by the user.
2. **Upcoming View (`DueDate > Today`):**
   - Future planning mode: Users can schedule, re-title, re-categorize, and delete future tasks.
   - **Completion Lock:** Marking a future task as completed is blocked with an `InvalidOperationException` (HTTP 400 Bad Request) until that date arrives.
3. **History Archive (`DueDate < Today`):**
   - Strictly **Read-Only**: Past dates are permanently preserved. Creating tasks in the past, modifying existing records, or deleting historical tasks is blocked at the service level (HTTP 400).
   - Visual status badges clearly indicate whether a task was **Completed** (with exact completion time) or **Missed**.

---

### Frontend Architecture (React 19 + TypeScript)

The frontend is a lightweight, high-performance Single Page Application built with **React 19**, **TypeScript**, and **Vite**:

- **Modern SaaS Aesthetics:** Inspired by Linear, Todoist, and Notion with clean typography, subtle elevation shadows, and spacious layout (`1140px` max-width).
- **Dual Theme Engine (Dark & Light Mode):**
  - **Light Mode:** Crisp white cards against a soft slate-rose background (`#F4F4F7`) with well-defined slate borders (`#CBD5E1`) and soft shadows.
  - **Dark Mode:** Deep slate background (`#0F172A`), elevated surface cards (`#1E293B`), subtle borders (`#334155`), and luminous Indigo accents (`#818CF8`).
  - Automatic detection of `prefers-color-scheme` with one-click navbar toggle and `localStorage` persistence.
- **Top Quick-Add Bar:** Create tasks directly from the top of the workspace with instant Enter-key scheduling and an expandable options tray for descriptions, categories, due dates, and recurrence toggles.
- **Compact Progress Header:** Replaces bulky stat tiles with a streamlined completion ratio (`3 of 5 completed`) and smooth animated progress bar.
- **Category Management with Centered Modal:** Horizontal scrollable category filter pills paired with a clean `+ Category` button that opens a centered dialog with 10 preset swatches and custom hex picker.
- **Responsive 2-Row Mobile Header:** Automatically adapts on screens $\le 640\text{px}$ into a clean two-row layout with zero horizontal overflow.

---

## 3. Repository Structure

```
TaskManagerAI/
├── .antigravity/                      # AI Agent Constitution & Specialized Skills
│   ├── rules.md                       # Project coding constitution (zero var, zero any, clean layers)
│   └── skills/
│       ├── create-backend-feature/    # Vertical slice engineering skill
│       ├── create-frontend-feature/   # TypeScript contract alignment skill
│       └── review-code/               # Senior architectural code reviewer skill
├── backend/
│   ├── Dockerfile                     # Optimized multi-stage .NET 10 container image
│   ├── TaskManager.sln                # Solution file linking all projects
│   ├── TaskManager.Domain/            # Entities: User, TaskItem, Category
│   ├── TaskManager.Application/       # DTOs, Service Interfaces, TaskService, CategoryService
│   ├── TaskManager.Infrastructure/    # DbContext, Npgsql, Repositories, PBKDF2, JWT
│   │   └── Migrations/                # EF Core PostgreSQL migrations
│   ├── TaskManager.API/               # Controllers, Middleware, Auth Configuration, Program.cs
│   │   ├── appsettings.json           # Default configuration
│   │   └── appsettings.Development.json
│   └── TaskManager.Tests/             # 46+ xUnit unit tests (Services, Auth, Recurrence)
├── frontend/
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Dependencies (React 19, TypeScript, Vite)
│   ├── tsconfig.json                  # Strict TypeScript configuration
│   ├── vite.config.ts                 # Vite bundler configuration
│   └── src/
│       ├── App.tsx                    # Main SaaS workspace layout & view switcher
│       ├── App.css                    # Complete modern SaaS theme (Dark/Light tokens)
│       ├── components/                # Modular UI components
│       │   ├── AuthView.tsx           # SaaS Login / Registration view with theme toggle
│       │   ├── CategoryBadge.tsx      # Color-coded category badge
│       │   ├── CategoryModal.tsx      # Centered category creation & management dialog
│       │   ├── TaskFilters.tsx        # Horizontal category pills, search bar & status tabs
│       │   ├── TaskForm.tsx           # Top-down Quick-Add task bar
│       │   ├── TaskItem.tsx           # Linear-style task row with custom circular checkbox
│       │   └── TaskStats.tsx          # Compact progress ratio and animated progress bar
│       ├── hooks/
│       │   └── useTheme.ts            # Theme management hook (Light/Dark/System)
│       ├── services/                  # Typed API integration
│       │   ├── apiConfig.ts           # Dynamic API Base URL resolver
│       │   ├── authService.ts         # JWT storage & authenticated header management
│       │   ├── categoryService.ts     # Category CRUD API client
│       │   └── taskService.ts         # Task CRUD, Upcoming, and Archive API client
│       └── types/                     # Strict TypeScript interfaces (Zero 'any')
│           ├── auth.ts
│           ├── category.ts
│           └── task.ts
└── README.md                          # Project documentation
```

---

## 4. Local Setup & Installation Guide

### Prerequisites

Ensure you have the following installed on your machine:
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) (`dotnet --version` $\ge$ `10.0.x`)
- [Node.js](https://nodejs.org/) (`v18.x` or higher) & `npm`
- A PostgreSQL database:
  - Local PostgreSQL server, or
  - Free cloud PostgreSQL database from [Neon](https://neon.tech/)

---

### Backend Setup (.NET 10)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/badahbilal/TaskManagerAI.git
   cd TaskManagerAI
   ```

2. **Configure Connection String & JWT Settings:**
   Open `backend/TaskManager.API/appsettings.json` (or set environment variables):
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=TaskManagerDb;Username=postgres;Password=your_password"
     },
     "Jwt": {
       "Key": "YourSuperSecretKeyWithAtLeast32CharactersLong2026!#*",
       "Issuer": "TaskManagerAI",
       "Audience": "TaskManagerClient"
     }
   }
   ```
   > **Tip:** You can also use a free cloud PostgreSQL connection string from Neon:
   > `"DefaultConnection": "postgres://user:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"`

3. **Restore & Build Backend:**
   ```bash
   dotnet restore backend/TaskManager.sln
   dotnet build backend/TaskManager.sln
   ```

4. **Apply Database Migrations:**
   Migrations are automatically applied on application startup! Alternatively, you can apply them manually via EF Core CLI:
   ```bash
   dotnet ef database update --project backend/TaskManager.Infrastructure --startup-project backend/TaskManager.API
   ```

5. **Run the API:**
   ```bash
   dotnet run --project backend/TaskManager.API
   ```
   The backend API will start on `http://localhost:5000` (or the port specified by `PORT` / `launchSettings.json`).

---

### Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the `frontend/` directory (or edit `.env.development`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start Vite Development Server:**
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:5173`.

5. **Verify Production Build:**
   ```bash
   npm run build
   ```

---

### Running Tests

Execute the xUnit test suite covering authentication, data isolation, date-based permissions, and daily recurrence:

```bash
dotnet test backend/TaskManager.sln
```

**Expected output:**
```text
Passed!  - Failed: 0, Passed: 46, Skipped: 0, Total: 46, Duration: 570 ms - TaskManager.Tests.dll
```

---

## 5. Cloud Deployment Architecture & Hosting Comparison

The application is deployed to production using a cost-efficient, 100% cloud-native architecture combining **Neon**, **Netlify**, **Render**, and **Railway**.

```
  ┌─────────────────────────────────┐
  │         React Frontend          │
  │      Hosted on Netlify          │
  │  (Global CDN, Permanent Free)   │
  └────────────────┬────────────────┘
                   │
                   │ HTTPS API Requests (Bearer JWT)
                   ▼
  ┌─────────────────────────────────┐
  │   .NET 10 Container Backend     │
  │     Hosted on Render / Railway  │
  │   (Dockerized ASP.NET 10 API)   │
  └────────────────┬────────────────┘
                   │
                   │ SSL Pooled Connection
                   ▼
  ┌─────────────────────────────────┐
  │     Serverless PostgreSQL       │
  │       Hosted on Neon            │
  │  (Zero-Maintenance, Auto-Scale) │
  └─────────────────────────────────┘
```

### Hosting Platforms Overview

1. **Database — [Neon](https://neon.tech/) (Serverless PostgreSQL):**
   - Provides managed PostgreSQL 16 on AWS.
   - Automatically handles connection pooling, point-in-time recovery, and instant branching.
   - Free tier includes 0.5 GB storage with compute auto-suspend, making it ideal for low-cost, high-reliability operation.
2. **Frontend — [Netlify](https://www.netlify.com/) (Single Page Application):**
   - Continuously deploys from the GitHub `main` branch on every push.
   - Global CDN distribution with automated HTTPS and instant cache invalidation.
   - Hosts the permanent production web app at **[https://taskmanager-ai-pro.netlify.app/](https://taskmanager-ai-pro.netlify.app/)** and the staging environment at **[https://taskmanagerai-badah.netlify.app/](https://taskmanagerai-badah.netlify.app/)**.
3. **Backend Host — [Render](https://render.com/) (Permanent Production Host — Free Tier):**
   - Configured as the **permanent long-term production backend** running the multi-stage `.NET 10 Dockerfile` to power the live production app ([taskmanager-ai-pro.netlify.app](https://taskmanager-ai-pro.netlify.app/)).
   - **Cold Start Characteristic:** On Render's Free Web Service tier, instances automatically spin down after 15 minutes of inactivity. When a new request arrives, Render spins up the container in ~30–45 seconds, after which it runs with full responsiveness. The service remains completely free indefinitely.
4. **Backend Staging — [Railway](https://railway.app/) (Temporary Staging / Trial Host):**
   - Configured as the staging backend powering the trial environment ([taskmanagerai-badah.netlify.app](https://taskmanagerai-badah.netlify.app/)).
   - Utilized during active development and rapid feature verification with a $5 / 30-day trial credit.
   - Always-on compute during the active trial window without cold starts. Once the trial period expires, services pause automatically.

---

### Platform Comparison Matrix

| Component | Platform | Role in Project | Live URL | Cost / Tier | Cold Start / Uptime | Key Benefits |
|---|---|---|---|---|---|---|
| **Frontend** | **Netlify** | **Production Web App** | [taskmanager-ai-pro.netlify.app](https://taskmanager-ai-pro.netlify.app/) | **Free Tier** | Instant (Global CDN) | Continuous Git deployment, HTTPS, zero cold start |
| **Backend** | **Render** | **Permanent Production** | Backs Production App | **Free Tier** | ~30–45s wake-up after 15 min idle | **Free indefinitely**, automatic Docker build from Git, managed environment variables |
| **Frontend** | **Netlify** | **Staging Web App** | [taskmanagerai-badah.netlify.app](https://taskmanagerai-badah.netlify.app/) | **Free Tier** | Instant (Global CDN) | Rapid feature staging, live multi-environment verification |
| **Backend** | **Railway** | **Temporary Staging** | Backs Staging App | **30-Day Trial ($5)** | Always active during trial | Ultra-fast build times, zero idle sleep during trial period |
| **Database** | **Neon** | **Primary Database** | Shared by both environments | **Free Tier** (0.5 GB) | Always online (Serverless) | Instant branching, SSL pooled connection, zero maintenance |

---

### Docker Containerization

The backend includes a production-optimized multi-stage Dockerfile ([`backend/Dockerfile`](backend/Dockerfile)) targeting `.NET 10`:

```dockerfile
# Stage 1: Runtime Base
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# Stage 2: Build with Layer Caching
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["TaskManager.Domain/TaskManager.Domain.csproj", "TaskManager.Domain/"]
COPY ["TaskManager.Application/TaskManager.Application.csproj", "TaskManager.Application/"]
COPY ["TaskManager.Infrastructure/TaskManager.Infrastructure.csproj", "TaskManager.Infrastructure/"]
COPY ["TaskManager.API/TaskManager.API.csproj", "TaskManager.API/"]
RUN dotnet restore "TaskManager.API/TaskManager.API.csproj"

COPY . .
WORKDIR "/src/TaskManager.API"
RUN dotnet build "TaskManager.API.csproj" -c Release -o /app/build

# Stage 3: Publish
FROM build AS publish
RUN dotnet publish "TaskManager.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Production Runtime
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TaskManager.API.dll"]
```

#### Build and Run Locally with Docker:
```bash
# Build the Docker image from backend directory
docker build -t taskmanager-api:latest -f backend/Dockerfile backend/

# Run the container
docker run -d -p 8080:8080 \
  -e ConnectionStrings__DefaultConnection="Host=your_host;Database=your_db;Username=your_user;Password=your_pass" \
  -e JWT_KEY="YourSuperSecretKeyWithAtLeast32CharactersLong2026!#*" \
  --name taskmanager-api taskmanager-api:latest
```

---

## 6. Contributing & Constitution

When contributing to this repository, all modifications must adhere to the project constitution established in [`.antigravity/rules.md`](.antigravity/rules.md):

1. **Explicit C# Typing:** Never declare local variables with `var`. Always use explicit types (`TaskItem item = new TaskItem();`, `List<TaskDto> dtos = ...`).
2. **Strict TypeScript:** Avoid the `any` keyword entirely. Define explicit interfaces in `frontend/src/types/`.
3. **Clean Architecture Layers:**
   - `Domain` must have zero package references.
   - `Application` depends only on `Domain`.
   - `Infrastructure` implements `Application` abstractions.
   - `API` orchestrates DI and HTTP routing.
4. **Mandatory Verification Loop:**
   - Run `dotnet test backend` (all tests must pass with 0 failures).
   - Run `npm --prefix frontend run build` (0 TypeScript or linting errors).

---

## 7. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

*Authored by [Bilal Badah](https://github.com/badahbilal) — Engineered with Google Antigravity & Model Context Protocol.*
