# AGENT CONTEXT & MEMORY (`agent.md`)

## 1. Project Mission & Context
- **Project Name:** The Student Tutoring Application (StudyConnect) Backend
- **Core Goal:** Peer-to-peer academic support platform connecting students who need help in challenging courses with peers who excel in those courses, plus study partner matching, academic resource sharing, and progress tracking.
- **GitHub Repository:** `https://github.com/samuelbukumni/campusconnect` (Active remote: `origin/main`)
- **Team Dynamics:** Team of 10 to 12 members; 4 to 5 members are complete beginners with zero backend experience. Supervisor will individually examine each member during project defense. All architecture and explanations must be plain-language defensible without intimidating jargon.
- **Email Service Choice:** Resend (locked in).
- **Counting Strategy:** Standard indexed relational SQL COUNT() (chosen for data integrity, zero sync bugs, and defensibility before academic supervisors).
- **PRD Document:** Exported as PDF at `StudyConnect_Backend_PRD_Technical_Spec.pdf` and markdown at `PRD_TECHNICAL_SPEC.md`.

---

## 2. Agent Communication Directives (Memory Rules)
1. **Concise & Non-Verbose Communication:** Do not clutter conversation with unnecessary fluff. Deliver direct, high-signal responses.
2. **Learn-First Pedagogical Flow:** For every feature discussion:
   - *Step 1: Real-World Experience (Frontend / Student Perspective)*: How does a student experience this on their screen? (e.g., student selects course, picks a time slot, sees tutor reputation).
   - *Step 2: Technical Implementation (Backend / Database / API)*: How the NestJS controller, service, TypeORM entity, and PostgreSQL table power that exact experience.
3. **Decisions via Concrete Real-World Options:**
   - Avoid shallow binary "yes/no" prompts.
   - Present 2 to 4 viable real-time options with explicit trade-offs (speed, scalability, junior readability, maintenance).
   - If the user cannot decide, proactively break down which option best covers the deadline and product vision.
4. **Strict Conventional Git Commits:**
   - Format: `<type>(<scope>): <short description>`
   - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
   - Examples: `feat(auth): implement student registration and JWT login`, `docs(readme): add architecture file map and quickstart guide`.

---

## 3. Architecture & Folder Conventions
Every concern lives in its own dedicated folder without displacement:
```text
src/
├── common/             # Cross-cutting concerns (decorators, filters, guards, interceptors, interfaces)
├── config/             # Typed environment configs (app, database, jwt)
├── database/           # TypeORM DataSource, BaseEntity, Migrations
└── modules/
    ├── auth/           # Authentication domain (DTOs, guards, strategies, service, controller, tests)
    ├── users/          # Student profiles, roles, repository, service, controller, tests
    ├── courses/        # Courses, topics, search & tutor availability metrics
    ├── tutoring/       # 1-on-1 and group sessions, scheduling, pairing & reshuffling
    ├── partners/       # Study & reading partner matching
    ├── materials/      # Academic resource sharing (notes, past questions, summaries)
    ├── reviews/        # Tutor ratings (1-5 stars), testimonials, reputation
    ├── attendance/     # Attendance tracking & verification
    ├── reports/        # Conduct reporting & safety guidelines
    └── notifications/  # Reminders & session alerts
```

Each feature module contains:
- `controllers/` - HTTP request handlers and Swagger decorators
- `services/` - Business logic and transactions
- `dto/` - Input validation schemas (`class-validator`)
- `entities/` - TypeORM database models (or in `database/entities` if shared)
- `repositories/` - Custom data access methods (where applicable)
- `tests/` - Unit tests (`.spec.ts`)

---

## 4. Database Schema Strategy (PostgreSQL + TypeORM)
### How Database Schemas Are Managed:
- **Shared Base Entity:** All tables inherit `BaseEntity` (`id` as UUID, `createdAt`, `updatedAt`).
- **Domain Co-located Entities:** Each module defines its domain entities (e.g., `User` in `src/modules/users/entities/user.entity.ts`).
- **Centralized Data Source:** `src/database/data-source.ts` connects TypeORM CLI and NestJS app runtime to PostgreSQL.
- **Migration Pipeline:** `npm run migration:generate` and `npm run migration:run` ensure schema changes are safe and reproducible across the team.

### Implemented Schema:
- **`users` Table:**
  - `id`: UUID (PK)
  - `email`: VARCHAR(255) UNIQUE
  - `password`: VARCHAR(255) (Hashed bcrypt, hidden by default)
  - `firstName`, `lastName`: VARCHAR(100)
  - `matricNumber`: VARCHAR(50)
  - `department`: VARCHAR(150)
  - `level`: VARCHAR(50) (e.g. 100, 200, 300, 400, 500)
  - `role`: ENUM ('LEARNER', 'TUTOR', 'BOTH', 'ADMIN')
  - `bio`: TEXT
  - `avatarUrl`, `phoneNumber`: VARCHAR
  - `coursesToTeach`: TEXT[]
  - `coursesNeedingHelp`: TEXT[]
  - `rating`: DECIMAL(3,2)
  - `reviewCount`: INT
  - `totalSessionsGiven`: INT
  - `totalSessionsAttended`: INT
  - `isVerified`: BOOLEAN
  - `isActive`: BOOLEAN
  - `createdAt`, `updatedAt`: TIMESTAMPTZ

---

## 5. Current Implementation Progress
- [x] Initialized NestJS architecture with strict TypeScript config.
- [x] Configured TypeORM with PostgreSQL connection and environment validation.
- [x] Implemented global `TransformInterceptor` (unified JSON API format).
- [x] Implemented global `AllExceptionsFilter` (centralized error handling).
- [x] Implemented Swagger / OpenAPI documentation playground at `/docs`.
- [x] Implemented `UsersModule` (Entity, Repository, Service, Controller, DTOs, Unit tests).
- [x] Implemented `AuthModule` (Register, Login, JWT Strategy, Local Strategy, Auth Guards).
- [x] Implemented Resend Email & OTP Verification Flow (6-digit generation, 10-minute expiry, 60s cooldown burst rate limit).
- [x] Implemented `GET /api/v1/auth/me` returning authenticated session + complete student profile details.
- [x] Implemented `CoursesModule` (Course & Topic entities, repository, service, controller, DTOs, unit tests).
- [x] Implemented granular topic-based search (`GET /api/v1/courses/search?q=...`) across course code, title, and syllabus topics.
- [x] Implemented real-time tutor demand metrics (`availableTutorsCount` vs `learnersSeekingHelpCount`) per course.
- [x] Implemented course catalog seed endpoint (`POST /api/v1/courses/seed`).
- [x] Scaffolded modular boundaries for upcoming domains (`tutoring`, `partners`, `materials`, `reviews`, `attendance`, `reports`, `notifications`).
- [x] Prepared comprehensive, beginner-friendly `README.md` with file map.
- [x] Generated official PDF PRD & Technical Spec at `StudyConnect_Backend_PRD_Technical_Spec.pdf`.
- [ ] Database credentials connection testing and initial migration run.
- [ ] Implement Tutoring Session booking and scheduling.
