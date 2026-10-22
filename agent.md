# AGENT CONTEXT & MEMORY (`agent.md`)

## 1. Project Mission & Context
- **Project Name:** The Student Tutoring Application (StudyConnect) Backend
- **Core Goal:** Peer-to-peer academic support platform connecting students who need help in challenging courses with peers who excel in those courses, plus study partner matching, academic resource sharing, and progress tracking.
- **GitHub Repository:** `https://github.com/samuelbukumni/campusconnect` (Active remote: `origin/main`)
- **Team Dynamics:** Team of 10 to 12 members; 4 to 5 members are complete beginners with zero backend experience. Supervisor will individually examine each member during project defense. All architecture and explanations must be plain-language defensible without intimidating jargon.
- **Email Service Choice:** Resend (locked in).
- **Attendance Feature:** Permanently dropped / removed per team instruction.
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
5. **No Pushing Rule:**
   - NEVER push to GitHub without the user explicitly typing "push".

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
    ├── tutoring/       # 1-on-1 and group sessions, scheduling, joining, status lifecycle
    ├── partners/       # Study & reading partner matching and reshuffling
    ├── materials/      # Academic resource sharing (notes, past questions, download counters)
    ├── reviews/        # Tutor ratings (1-5 stars), testimonials, reputation recalculation
    ├── reports/        # Conduct reporting & safety guidelines with admin resolution
    └── notifications/  # In-app student alerts & reminders
```

Each feature module contains:
- `controllers/` - HTTP request handlers and Swagger decorators
- `services/` - Business logic and transactions
- `dto/` - Input validation schemas (`class-validator`)
- `entities/` - TypeORM database models
- `repositories/` - Data access methods
- `tests/` - Unit tests (`.spec.ts`)

---

## 4. Current Implementation Progress
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
- [x] Removed attendance tracking permanently per team specification.
- [x] Implemented `TutoringModule` (1-on-1, group sessions, booking, joining, status transitions, unit tests).
- [x] Implemented `PartnersModule` (peer study matching, reshuffle logic, unit tests).
- [x] Implemented `MaterialsModule` (lecture notes/past questions, keyword search, download tracking, unit tests).
- [x] Implemented `ReviewsModule` (1-5 star reviews, testimonials, auto tutor rating recalculation, unit tests).
- [x] Implemented `ReportsModule` (misconduct/safety reporting, admin status resolution, unit tests).
- [x] Implemented `NotificationsModule` (in-app alerts, unread counts, mark as read, unit tests).
- [x] Registered all 11 entities in `src/database/data-source.ts`.
- [x] Full unit test suite passing (9 test suites, 40 unit test assertions).
- [x] Production build clean (`nest build` exits 0 with zero errors).
- [x] Prepared streamlined `README.md` with Render Phase 7 deployment guide.
