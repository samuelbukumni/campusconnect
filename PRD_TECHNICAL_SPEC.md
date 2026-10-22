# 📄 StudyConnect — Product Requirements Document (PRD) & Technical Specification

**Version:** 1.0 (Production & Defense Edition)  
**Stack:** NestJS, PostgreSQL, TypeORM, Redis, Resend  
**Target Platform:** Render.com Cloud Hosting  
**PDF Document:** [StudyConnect_Backend_PRD_Technical_Spec.pdf](file:///c:/Users/Admin/Desktop/Study-connect-Backend/StudyConnect_Backend_PRD_Technical_Spec.pdf)

---

## 1. Executive Summary & Problem Statement

### 1.1 The Academic Challenge
In university environments, students often struggle with specific demanding courses or topics (such as Calculus in `MTH 102` or Data Structures in `CSC 201`). At the same time, talented peer students who have mastered these subjects are willing to assist their classmates but lack a structured, safe, and organized campus medium to schedule sessions, share verified study materials, or track tutorial attendance.

### 1.2 The Solution
**StudyConnect** bridges this gap through a dual-role peer-to-peer ecosystem. Students do not choose to be solely learners or tutors; they can tutor courses where they excel while receiving peer academic assistance in courses they find challenging.

---

## 2. The 5-Layer Backend Architecture

To ensure every team member understands how a request flows through the backend (and can clearly explain it during project defense), the application follows a strict 5-layer separation of concerns:

```text
[ CLIENT (Web Browser / Mobile App) ]
         │ (HTTP Request with JSON payload & optional Bearer JWT)
         ▼
[ 1. CONTROLLER LAYER ] (src/modules/*/controllers/*.controller.ts)
   • Listens on HTTP endpoints (GET, POST, PATCH, DELETE)
   • Enforces DTO validation via class-validator (strips invalid fields)
   • Applies authentication guards (@UseGuards(JwtAuthGuard))
         │
         ▼
[ 2. SERVICE LAYER ] (src/modules/*/services/*.service.ts)
   • Houses all business logic and calculations
   • Hashes passwords with bcryptjs
   • Triggers OTP generation and Resend email dispatches
   • Calculates rating averages and attendance counters
         │
         ▼
[ 3. REPOSITORY LAYER ] (src/modules/*/repositories/*.repository.ts)
   • Abstraction for database queries
   • Isolates complex SQL / query builders from business logic
         │
         ▼
[ 4. TYPEORM ENTITY / SCHEMA LAYER ] (src/modules/*/entities/*.entity.ts)
   • TypeScript classes decorated with @Entity(), @Column(), @ManyToOne()
   • Represents the strict structure of our tables in code
         │
         ▼
[ 5. POSTGRESQL DATABASE ] (Hosted on Render.com)
   • Permanent, relational ACID-compliant data storage
```

---

## 3. Technology Choices & Architectural Justification

| Technology | What It Is | Why It Was Picked Over Alternatives | Real-Time Impact |
| :--- | :--- | :--- | :--- |
| **NestJS (TypeScript)** | Enterprise Node.js web framework. | Plain Express gives zero structure, causing displaced files in multi-developer teams. NestJS enforces modular architecture. | Each module (Auth, Users, Courses, Tutoring) has its own self-contained folder. |
| **PostgreSQL** | Relational SQL database. | Selected over MongoDB because students, courses, bookings, and reviews are strictly relational. Foreign keys eliminate orphan records. | 100% data integrity; impossible to book a session for a non-existent student or course. |
| **TypeORM** | Object-Relational Mapper (ORM). | Translates TypeScript entity classes directly into PostgreSQL tables, eliminating manual SQL string errors. | Automatic schema synchronization in development; clean migrations for production. |
| **Redis** | In-memory data structure store. | Storing temporary 10-minute OTP codes and rate-limiting counters in PostgreSQL wastes disk I/O. Redis keeps them in RAM. | Sub-millisecond (< 1ms) response times for rate-limiting checks and OTP verification. |
| **Resend** | Modern email delivery API. | Provides 3,000 free emails/month, requires zero server setup, and sends transactional verification emails via a 3-line SDK call. | Instant OTP code delivery to student inboxes without maintenance headaches. |
| **Bcryptjs** | Password hashing library. | Pure JavaScript implementation. Native C++ bcrypt fails to compile on many Windows student machines. Bcryptjs works everywhere. | Secure, salt-based one-way password hashing across all operating systems. |
| **Swagger (OpenAPI)** | Interactive API documentation. | Auto-generates a live web playground at `/docs` from TypeScript code, eliminating manual Postman exports. | Beginners and frontend engineers can test endpoints directly in their web browser. |
| **Render.com** | Cloud hosting platform. | Free managed PostgreSQL database and Node.js web services with direct Git integration. | Zero-cost production deployment with automatic redeployment on git push. |

---

## 4. Detailed Feature Specifications & Technical Realization

### 4.1 Student Authentication & Resend OTP Verification
* **Functional Flow:** Student registers with university email, department, level, and picks role (`TUTOR`, `LEARNER`, or `BOTH`). An unverified account is created and a 6-digit OTP code (valid for 10 minutes) is sent via **Resend**. A 60-second cooldown prevents spam. Once verified, a JWT token is issued.
* **Technical Aspect:**
  - `POST /api/v1/auth/register` ➔ Validates body via `RegisterDto`, hashes password with `bcryptjs` (cost 10), saves User with `isVerified: false`.
  - `POST /api/v1/auth/verify-otp` ➔ Compares submitted OTP against Redis key `otp:{email}`. On match, sets `isVerified: true` and returns JWT Bearer token.
  - `POST /api/v1/auth/resend-otp` ➔ Rate-limited to 1 request per 60s per IP. Throws `429 Too Many Requests` if spammed.
  - `POST /api/v1/auth/login` ➔ Validates credentials via `LocalStrategy`, returns access token.

### 4.2 Student Profiles & Academic Course Preferences
* **Functional Flow:** Students specify course codes they can teach (e.g. `["CSC201", "MTH101"]`) and courses where they need help (e.g. `["PHY102"]`), along with a bio and contact info.
* **Technical Aspect:** Managed via `GET /api/v1/users/profile/me` and `PATCH /api/v1/users/profile/me` with TypeORM array/relation mapping.

### 4.3 Course Catalog & Topic-Based Granular Search
* **Functional Flow:** A student searching *"Integration"* or *"MTH 102"* finds matching curriculum topics, registered tutors, and live demand counts.
* **Technical Aspect:** `GET /api/v1/courses/search?q=Integration` executes indexed case-insensitive `ILIKE` matching on courses and topics with standard relational SQL counting (`COUNT`).

### 4.4 1-on-1 and Group Tutoring Sessions & Scheduling
* **Functional Flow:** Students book sessions by picking date, time, duration, session type (1-on-1 or group max 5), and a physical meetup location or Google Meet link.
* **Technical Aspect:** `POST /api/v1/tutoring/sessions` creates a session with `SCHEDULED` status. Tutors and learners view schedules via `GET /api/v1/tutoring/my-sessions`.

### 4.5 Study & Reading Partner Matching with Reshuffle
* **Functional Flow:** Classmates taking the same courses are paired as reading partners. If a partner is inactive, clicking *"Reshuffle"* finds a new peer.
* **Technical Aspect:** `POST /api/v1/partners/match` pairs complementary learners; `POST /api/v1/partners/:id/reshuffle` marks current pair `RESHUFFLED` and queries the next candidate.

### 4.6 Attendance Tracking & Verification
* **Functional Flow:** When a tutorial ends, the tutor marks attendance. The learner's attended sessions count increments and the session is marked completed.
* **Technical Aspect:** `POST /api/v1/attendance/:id/verify` updates attended status in `session_participants` and increments stats in a database transaction.

### 4.7 Tutor Ratings, Reviews & Testimonials
* **Functional Flow:** Learners rate verified tutors from 1 to 5 stars and leave written testimonials. Tutor average rating updates automatically.
* **Technical Aspect:** `POST /api/v1/reviews` validates that attendance was completed, then re-aggregates the tutor average rating in PostgreSQL.

### 4.8 Academic Material Sharing Hub
* **Functional Flow:** Students upload and download past examination papers, lecture notes, and cheat-sheets categorized by course code. Max size 10MB.
* **Technical Aspect:** `POST /api/v1/materials/upload` checks MIME types (strictly PDF, DOCX, PNG, JPG) and stores files safely with download counters.

### 4.9 Student Safety & Conduct Reporting
* **Functional Flow:** Students can report inappropriate conduct or missed meetups with one click for administrative review.
* **Technical Aspect:** `POST /api/v1/reports` creates moderation records with reporter ID, reported ID, reason, and status flags.

---

## 5. Database Schema & Data Dictionary

All tables inherit UUID primary keys and timestamp tracking from `BaseEntity`:

* **`users`**: `id`, `email`, `password`, `firstName`, `lastName`, `role`, `department`, `level`, `coursesToTeach`, `coursesNeedingHelp`, `rating`, `isVerified`
* **`courses`**: `id`, `code` (e.g. MTH102), `title`, `department`, `level`
* **`topics`**: `id`, `courseId` (FK), `title` (e.g. Integration), `difficulty`
* **`tutoring_sessions`**: `id`, `tutorId` (FK), `courseId` (FK), `sessionType`, `locationVenue`, `meetingUrl`, `scheduledAt`, `status`
* **`session_participants`**: `id`, `sessionId` (FK), `learnerId` (FK), `attended` (Boolean)
* **`study_partner_matches`**: `id`, `studentAId` (FK), `studentBId` (FK), `courseId` (FK), `status` (ACTIVE / RESHUFFLED)
* **`materials`**: `id`, `uploaderId` (FK), `courseId` (FK), `title`, `fileUrl`, `fileType`, `downloadsCount`
* **`reviews`**: `id`, `sessionId` (FK), `tutorId` (FK), `learnerId` (FK), `rating` (1-5), `testimonial`
* **`reports`**: `id`, `reporterId` (FK), `reportedUserId` (FK), `reason`, `description`, `status` (PENDING / RESOLVED)

---

## 6. Security & Standardized Envelope Architecture

* **Response Envelope:** All successful responses are structured as `{ success: true, statusCode, message, data, timestamp }`.
* **Exception Filter:** All errors are returned uniformly as `{ success: false, statusCode, message, path, timestamp }`.
* **Rate Limiting:** OTP requests limited to 1 per 60s per IP; login attempts capped at 5 per 15 minutes to prevent brute-force attacks.

---

## 7. Cloud Deployment Guide (Render.com)

1. **Managed PostgreSQL:** Create a free PostgreSQL instance on Render named `study-connect-db` and copy the connection credentials.
2. **Web Service:** Connect the GitHub repository to Render as a Node Web Service using build command: `npm install && npm run build`.
3. **Environment Configuration:** Set `PORT=3000`, `NODE_ENV=production`, database credentials, `JWT_SECRET`, and `RESEND_API_KEY`.
4. **Live Verification:** Verify health at `/api/v1/health` and interact with the live Swagger playground at `/docs`.
