# 🎓 The Student Tutoring Application (StudyConnect) — Backend API

Welcome to the backend repository of **StudyConnect**, a peer-to-peer academic platform designed to connect students who need academic assistance with fellow students who excel in those subjects.

Built with **NestJS**, **TypeORM**, and **PostgreSQL**.

---

## 📖 Table of Contents
1. [Project Overview & Problem Statement](#-project-overview--problem-statement)
2. [How the Application Works](#-how-the-application-works)
3. [Where to Find What (Project File Map)](#-where-to-find-what-project-file-map)
4. [Database & Schema Architecture](#-database--schema-architecture)
5. [Getting Started (Quick Setup Guide)](#-getting-started-quick-setup-guide)
6. [API Endpoints Overview & Testing](#-api-endpoints-overview--testing)
7. [Git Conventions for the Team](#-git-conventions-for-the-team)
8. [Roadmap & Upcoming Features](#-roadmap--upcoming-features)

---

## 🌟 Project Overview & Problem Statement

### The Problem
In academic institutions, many students encounter difficulty grasping specific topics (e.g. Calculus in `MTH101` or Data Structures in `CSC201`). At the same time, many peers have mastered these exact subjects and are ready to help, but there is no structured campus platform to match them, schedule sessions, share past questions/notes, or verify accountability.

### How StudyConnect Solves This
1. **Dual Student Role**: A student isn't just a learner or a tutor — they can tutor courses they understand while receiving tutoring in courses they find tough.
2. **One-on-One & Group Tutorials**: Book study sessions with clear locations (library, campus hub, online) and scheduled times.
3. **Study & Reading Partners**: Find peers with similar study schedules and goals.
4. **Academic Material Hub**: Share lecture summaries, previous exam questions, and solutions.
5. **Trust & Quality**: Peer reviews, 1-to-5 star ratings, attendance records, and student verification.

---

## 🗂 Where to Find What (Project File Map)

To make it easy for everyone on the team (especially beginners) to find their way around, every single concern is isolated in its own dedicated folder. Nothing is displaced.

```text
Study-connect-Backend/
├── .env.example                     # Sample environment variables (Copy to .env)
├── agent.md                         # Agent memory & technical decisions log
├── README.md                        # This project guide
├── nest-cli.json                    # NestJS CLI configuration
├── package.json                     # Dependencies and npm scripts
├── tsconfig.json                    # TypeScript compiler config & module path aliases
│
└── src/
    ├── main.ts                      # Application entry point (starts server, Swagger docs, global pipes)
    ├── app.module.ts                # Root module that bundles all submodules together
    ├── app.controller.ts            # Root controller (contains health check endpoint)
    ├── app.service.ts               # Root service
    │
    ├── common/                      # Reusable helpers used across all modules
    │   ├── decorators/              # Custom decorators
    │   │   ├── current-user.decorator.ts  # Extracts logged-in user from request (@CurrentUser())
    │   │   └── public.decorator.ts        # Marks endpoints public from auth (@Public())
    │   ├── filters/                 # Error handling
    │   │   └── http-exception.filter.ts   # Formats all errors into a uniform JSON response
    │   ├── guards/                  # Route guards
    │   │   └── jwt-auth.guard.ts          # Protects routes requiring valid JWT token
    │   ├── interceptors/            # Response transformers
    │   │   └── transform.interceptor.ts   # Wraps all successful responses into standard format
    │   └── interfaces/              # Shared TypeScript interfaces
    │       └── api-response.interface.ts  # Standard ApiResponse<T> contract
    │
    ├── config/                      # Typed configuration loaders
    │   ├── app.config.ts            # Port, API prefix, environment mode
    │   ├── database.config.ts       # PostgreSQL connection credentials
    │   └── jwt.config.ts            # JWT secrets and token expiration
    │
    ├── database/                    # Database setup
    │   ├── base.entity.ts           # Base model (provides id as UUID, createdAt, updatedAt)
    │   ├── data-source.ts           # TypeORM DataSource used for CLI migrations
    │   └── migrations/              # Database migration SQL files
    │
    └── modules/                     # Business domain modules
        ├── auth/                    # 🔐 AUTHENTICATION DOMAIN
        │   ├── controllers/         # POST /auth/register, POST /auth/login, GET /auth/me
        │   │   └── auth.controller.ts
        │   ├── dto/                 # Input validators
        │   │   ├── auth-response.dto.ts
        │   │   ├── login.dto.ts
        │   │   └── register.dto.ts
        │   ├── guards/              # Local auth guard for login
        │   │   └── local-auth.guard.ts
        │   ├── services/            # Password hashing, JWT token signing, credential validation
        │   │   └── auth.service.ts
        │   ├── strategies/          # Passport strategies (JWT & Local)
        │   │   ├── jwt.strategy.ts
        │   │   └── local.strategy.ts
        │   ├── tests/               # Unit tests
        │   │   └── auth.service.spec.ts
        │   └── auth.module.ts
        │
        ├── users/                   # 👤 USERS & STUDENT PROFILES
        │   ├── controllers/         # GET /users (search), GET/PATCH /users/profile/me
        │   │   └── users.controller.ts
        │   ├── dto/                 # User validation schemas
        │   │   ├── create-user.dto.ts
        │   │   ├── update-user.dto.ts
        │   │   └── user-profile.dto.ts
        │   ├── entities/            # Database schema for users table
        │   │   └── user.entity.ts
        │   ├── repositories/        # Custom database queries for users
        │   │   └── users.repository.ts
        │   ├── services/            # User creation, profile updates, tutor search logic
        │   │   └── users.service.ts
        │   ├── tests/               # Unit tests
        │   │   └── users.service.spec.ts
        │   └── users.module.ts
        │
        ├── courses/                 # 📚 Courses & topics catalog, search, demand stats
        ├── tutoring/                # 🤝 1-on-1 & group sessions, scheduling, pairing
        ├── partners/                # 👥 Study & reading partner matching
        ├── materials/               # 📁 Shared notes, summaries, and past questions
        ├── reviews/                 # ⭐ Tutor ratings & testimonials
        ├── attendance/              # 📋 Tutorial attendance tracking
        ├── reports/                 # 🛡️ Safety & inappropriate conduct reporting
        └── notifications/           # 🔔 Reminders & session alerts
```

---

## 🗄 Database & Schema Architecture

We use **PostgreSQL** as the relational database and **TypeORM** as the Object-Relational Mapper (ORM).

### How Schema Management Works:
1. **Modular Domain Entities:** Each module defines the database tables it owns inside its own `entities/` folder (e.g., `src/modules/users/entities/user.entity.ts`).
2. **Centralized Data Source:** `src/database/data-source.ts` registers all entities and provides the database connection for both the running NestJS app and TypeORM CLI.
3. **Automatic Synchronization in Development:** In `.env`, `DB_SYNCHRONIZE=true` automatically updates PostgreSQL tables when you edit entities during local development. For production, TypeORM migrations in `src/database/migrations/` are used.

### The `users` Table Schema:
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique student identifier |
| `email` | VARCHAR (Unique) | University or student email |
| `password` | VARCHAR | Hashed password (Bcrypt, never exposed in JSON) |
| `firstName`, `lastName` | VARCHAR | Student's full name |
| `matricNumber` | VARCHAR | Student matriculation / ID number |
| `department` | VARCHAR | Major/Department (e.g., Computer Science, Engineering) |
| `level` | VARCHAR | Academic level (e.g., `100`, `200`, `300`, `400`, `500`) |
| `role` | ENUM | `'LEARNER'`, `'TUTOR'`, `'BOTH'`, `'ADMIN'` |
| `bio` | TEXT | Short profile introduction |
| `coursesToTeach` | TEXT[] | Course codes the student can tutor (e.g. `["CSC201", "MTH101"]`) |
| `coursesNeedingHelp`| TEXT[] | Course codes where the student needs assistance |
| `rating` | DECIMAL | Average tutor rating (0.00 to 5.00) |
| `reviewCount` | INT | Number of student reviews received |
| `totalSessionsGiven`| INT | Total tutoring sessions taught |
| `totalSessionsAttended`| INT | Total tutoring sessions attended as a learner |
| `isVerified` | BOOLEAN | Student university verification status |
| `createdAt`, `updatedAt`| TIMESTAMPTZ | Timestamps |

---

## 🚀 Getting Started (Quick Setup Guide)

### Prerequisites
Make sure you have installed on your computer:
1. **Node.js** (v20 or newer recommended): Check with `node -v`
2. **PostgreSQL 16**: Ensure PostgreSQL is running on your machine.

---

### Step 1: Install Dependencies
Open your terminal in the project directory and run:
```bash
npm install
```

---

### Step 2: Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Open `.env` and verify your PostgreSQL credentials:
```env
PORT=3000
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=study_connect_db
DB_SYNCHRONIZE=true

JWT_SECRET=super_secret_jwt_key_study_connect_2026
JWT_EXPIRATION=7d
```

> **Note:** If `study_connect_db` does not exist in your PostgreSQL yet, create it using pgAdmin or the PostgreSQL terminal:
> ```sql
> CREATE DATABASE study_connect_db;
> ```

---

### Step 3: Run the Application in Development Mode
Start the live-reloading development server:
```bash
npm run start:dev
```
You will see output similar to:
```text
[Bootstrap] StudyConnect API is running on: http://localhost:3000/api/v1
[Bootstrap] Swagger API Docs available at: http://localhost:3000/docs
```

---

### Step 4: Explore the Interactive Swagger API Docs
Open your browser and navigate to:
👉 **`http://localhost:3000/docs`**

Here you can test all endpoints (Register, Login, View Profile, Search Tutors) directly from your browser without needing Postman!

---

## 📡 API Endpoints Overview & Testing

All endpoints are prefixed with `/api/v1`.

### 1. Health Check
- **`GET /api/v1/health`** — Public status endpoint.

### 2. Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | No | Register a new student (Tutor, Learner, or Both) |
| `POST` | `/api/v1/auth/login` | No | Log in with email & password, receives JWT token |
| `GET` | `/api/v1/auth/me` | Yes (Bearer) | Get current authenticated user session |

#### Sample Registration Payload (`POST /api/v1/auth/register`):
```json
{
  "email": "student@university.edu",
  "password": "SecurePassword123!",
  "firstName": "Alex",
  "lastName": "Johnson",
  "matricNumber": "ENG/2023/045",
  "department": "Electrical Engineering",
  "level": "300",
  "role": "BOTH",
  "bio": "Excelling in Circuit Theory (EEE301), looking for help in Engineering Mathematics (MTH301).",
  "coursesToTeach": ["EEE201", "EEE301"],
  "coursesNeedingHelp": ["MTH301"],
  "phoneNumber": "+2348012345678"
}
```

#### Sample Response:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Operation successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "tokenType": "Bearer",
    "user": {
      "id": "673f8d2b-c8c7-43a9-b148-f62305367be2",
      "email": "student@university.edu",
      "firstName": "Alex",
      "lastName": "Johnson",
      "role": "BOTH",
      "coursesToTeach": ["EEE201", "EEE301"],
      "coursesNeedingHelp": ["MTH301"]
    }
  },
  "timestamp": "2026-10-22T03:30:00.000Z"
}
```

---

### 3. Students / Users (`/api/v1/users`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/users` | Yes (Bearer) | Browse/filter tutors & learners (`?courseToTeach=MTH101`) |
| `GET` | `/api/v1/users/profile/me` | Yes (Bearer) | View current user profile |
| `PATCH`| `/api/v1/users/profile/me` | Yes (Bearer) | Update profile, bio, or courses |
| `GET` | `/api/v1/users/:id` | Yes (Bearer) | View any student's public profile and stats |

---

## 🤝 Git Conventions for the Team

Since we are working as a team of 6, maintaining clean Git commits makes code reviews effortless and ensures no one gets confused.

### Commit Message Format:
```text
<type>(<scope>): <short description in present tense>
```

### Commit Types:
- **`feat:`** A new feature (e.g. `feat(auth): implement student registration and JWT login`)
- **`fix:`** A bug fix (e.g. `fix(users): correct course filter query logic`)
- **`docs:`** Documentation changes (e.g. `docs(readme): add step-by-step setup guide`)
- **`refactor:`** Code restructuring without changing behavior (e.g. `refactor(database): extract base entity`)
- **`test:`** Adding or updating unit tests (e.g. `test(auth): add unit test for login service`)
- **`chore:`** Dependency updates, build configs (e.g. `chore: configure tsconfig aliases`)

### Branch Naming:
- `feat/feature-name` (e.g. `feat/tutoring-sessions`)
- `fix/bug-description` (e.g. `fix/jwt-expiration`)

---

## 🗺 Roadmap & Upcoming Modules

- [x] **Phase 1: Foundation & Authentication** (Done)
  - Project architecture, TypeORM setup, PostgreSQL config.
  - JWT Authentication, Student Registration, User Profiles.
  - Swagger documentation & unified error interceptors.
- [ ] **Phase 2: Courses & Matching Engine**
  - Course catalog & topic search (e.g. MTH102 -> Integration).
  - High-demand course metrics (count of learners needing help vs available tutors).
  - Random pairing and reshuffling algorithm.
- [ ] **Phase 3: Tutoring Sessions & Scheduling**
  - 1-on-1 and group tutorial booking.
  - Meetup location scheduling (campus buildings/rooms or online links).
- [ ] **Phase 4: Study Partners & Communities**
  - Partner matching by learning goals and schedules.
  - Course-specific community discussion boards.
- [ ] **Phase 5: Academic Materials & Resources**
  - File uploads for lecture notes, summaries, and past questions.
- [ ] **Phase 6: Reviews, Attendance & Trust**
  - Star ratings, student testimonials, tutorial attendance check-ins.
  - Safety reporting and conduct review.
