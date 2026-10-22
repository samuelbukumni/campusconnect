const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  bufferPages: true,
});

const outputPath = path.join(__dirname, '..', 'StudyConnect_Backend_PRD_Technical_Spec.pdf');
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const PRIMARY = '#1e3a8a';
const SECONDARY = '#0369a1';
const DARK = '#0f172a';
const BODY = '#334155';
const MUTED = '#64748b';
const LIGHT_BG = '#f1f5f9';

function header(title) {
  doc.moveDown(0.8);
  doc.fillColor(PRIMARY).fontSize(15).font('Helvetica-Bold').text(title);
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(45, doc.y + 2).lineTo(550, doc.y + 2).stroke();
  doc.moveDown(0.5);
}

function subheader(title) {
  doc.moveDown(0.5);
  doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text(title);
  doc.moveDown(0.2);
}

function para(text) {
  doc.fillColor(BODY).fontSize(9.5).font('Helvetica').text(text, { align: 'justify', lineGap: 2 });
  doc.moveDown(0.3);
}

function bullet(title, text) {
  doc.fillColor(DARK).fontSize(9.5).font('Helvetica-Bold').text(`• ${title}: `, { continued: true });
  doc.fillColor(BODY).font('Helvetica').text(text, { lineGap: 2 });
  doc.moveDown(0.2);
}

// COVER PAGE
doc.rect(45, 40, 505, 750).strokeColor('#cbd5e1').lineWidth(1.5).stroke();

doc.moveDown(4);
doc.fillColor(SECONDARY).fontSize(10).font('Helvetica-Bold').text('PROJECT REQUIREMENTS & TECHNICAL SPECIFICATION', { align: 'center' });
doc.moveDown(1.5);
doc.fillColor(PRIMARY).fontSize(26).font('Helvetica-Bold').text('StudyConnect API', { align: 'center' });
doc.moveDown(0.5);
doc.fillColor(MUTED).fontSize(13).font('Helvetica').text('The Peer-to-Peer Student Tutoring & Academic Platform', { align: 'center' });

doc.moveDown(4);
doc.rect(100, 260, 395, 170).fillAndStroke('#f8fafc', '#cbd5e1');

doc.fillColor(DARK).fontSize(10.5).font('Helvetica-Bold');
doc.text('DOCUMENT METADATA', 120, 275);
doc.moveDown(0.5);

const meta = [
  ['Document Version:', '1.0 (Production & Defense Edition)'],
  ['Architecture:', 'NestJS (TypeScript) + TypeORM + PostgreSQL + Redis'],
  ['Target Cloud Hosting:', 'Render.com Web & Database Service'],
  ['Notification System:', 'Resend Email API (OTP Verification)'],
  ['Project Type:', 'Peer-to-Peer Tutoring & Academic Resource Hub'],
  ['Date:', 'October 2026'],
];

meta.forEach(([k, v]) => {
  doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(9).text(k, 120, doc.y, { width: 130, continued: true });
  doc.fillColor(DARK).font('Helvetica').fontSize(9).text(v);
  doc.moveDown(0.3);
});

doc.fillColor(MUTED).fontSize(9).font('Helvetica').text(
  'Comprehensive blueprint for development, quality assurance, deployment, and academic evaluation.',
  100, 680, { width: 395, align: 'center' }
);

// PAGE 2: EXEC SUMMARY & 5-LAYER ARCHITECTURE
doc.addPage();
header('1. Executive Summary & Problem Statement');
para('University students frequently encounter academic challenges with specific demanding courses or topics (such as Calculus in MTH 102 or Data Structures in CSC 201). Simultaneously, academically strong peer students are willing to help but lack a safe, organized campus medium to connect, schedule tutorials, and share learning materials.');
para('StudyConnect resolves this by enabling a dual-role peer-to-peer ecosystem. Students do not choose to be solely learners or tutors; they can tutor courses where they excel while receiving peer academic assistance in courses they find challenging.');

header('2. The 5-Layer Backend Architecture');
para('The system is built on a clean 5-layer separation of concerns in NestJS, ensuring zero misplaced code:');

bullet('Layer 1 - Client Request', 'Frontend clients send HTTP requests with JSON bodies and Bearer JWT authorization headers.');
bullet('Layer 2 - Controller Layer', 'Listens to HTTP routes, validates input with class-validator DTOs, and enforces JWT guards.');
bullet('Layer 3 - Service Layer', 'Executes all core business logic, hashes passwords with bcryptjs, and handles rating algorithms.');
bullet('Layer 4 - Repository Layer', 'Abstracts data queries and encapsulates TypeORM operations from business logic.');
bullet('Layer 5 - Entity & PostgreSQL', 'TypeORM TypeScript entities map strictly to PostgreSQL relational tables, ensuring 100% ACID consistency.');

header('3. Technology Choices & Justification');
para('Every technology in this stack was selected for reliability, team collaboration speed, and academic defensibility:');

bullet('NestJS over Plain Express', 'Enforces strict modular folders (controllers, services, entities, DTOs), preventing displaced code in multi-developer teams.');
bullet('PostgreSQL over MongoDB', 'Students, bookings, courses, and ratings are strictly relational. Foreign keys eliminate corrupted or orphaned records.');
bullet('TypeORM over Raw SQL', 'Translates TypeScript entity classes directly into database schemas with automatic validation and compile-time type safety.');
bullet('Redis Cache & Throttler', 'Stores 10-minute temporary OTP codes and rate-limiting counters in memory for sub-millisecond response times without burdening the main database.');
bullet('Resend Email API', 'Reliable transactional email service delivering 6-digit verification OTPs to students without server maintenance overhead.');
bullet('Bcryptjs', 'Pure JavaScript implementation of salt-based password hashing that runs cleanly across all operating systems without native build failures.');
bullet('Render.com', 'Provides unified cloud hosting for PostgreSQL and Node.js with automated continuous deployment on git push.');

// PAGE 3: DETAILED FEATURE SPECIFICATION
doc.addPage();
header('4. Detailed Feature Specifications & Technical Realization');

subheader('4.1 Student Authentication & OTP Email Verification');
bullet('Functional Flow', 'Student registers with university email, department, level, and picks role (TUTOR, LEARNER, or BOTH). An unverified account is created and a 6-digit OTP code (valid for 10 minutes) is sent via Resend. A 60-second cooldown prevents spam.');
bullet('Technical Aspect', 'POST /api/v1/auth/register hashes password with bcryptjs and stores user as unverified. POST /api/v1/auth/verify-otp checks OTP in Redis, verifies account, and returns JWT. POST /api/v1/auth/resend-otp is rate-limited via NestJS Throttler.');

subheader('4.2 Student Profiles & Academic Course Preferences');
bullet('Functional Flow', 'Students specify course codes they can teach (e.g. CSC201, MTH101) and courses where they need help (e.g. PHY102), along with a bio and contact info.');
bullet('Technical Aspect', 'Managed via GET /api/v1/users/profile/me and PATCH /api/v1/users/profile/me with TypeORM array/relation mapping.');

subheader('4.3 Course Catalog & Topic-Based Granular Search');
bullet('Functional Flow', 'A student searching "Integration" or "MTH 102" finds matching curriculum topics, registered tutors, and live demand counts.');
bullet('Technical Aspect', 'GET /api/v1/courses/search?q=Integration executes indexed case-insensitive ILIKE matching on courses and topics with standard relational SQL counting.');

subheader('4.4 1-on-1 and Group Tutoring Sessions & Scheduling');
bullet('Functional Flow', 'Students book sessions by picking date, time, duration, session type (1-on-1 or group max 5), and a physical meetup location or Google Meet link.');
bullet('Technical Aspect', 'POST /api/v1/tutoring/sessions creates a session with SCHEDULED status. Tutors and learners view schedules via GET /api/v1/tutoring/my-sessions.');

subheader('4.5 Study & Reading Partner Matching with Reshuffle');
bullet('Functional Flow', 'Classmates taking the same courses are paired as reading partners. If a partner is inactive, clicking "Reshuffle" finds a new peer.');
bullet('Technical Aspect', 'POST /api/v1/partners/match pairs complementary learners; POST /api/v1/partners/:id/reshuffle marks current pair RESHUFFLED and queries the next candidate.');

subheader('4.6 Attendance Tracking & Verification');
bullet('Functional Flow', 'When a tutorial ends, the tutor marks attendance. The learner’s attended sessions count increments and the session is marked completed.');
bullet('Technical Aspect', 'POST /api/v1/attendance/:id/verify updates attended status in session_participants and increments stats in a database transaction.');

subheader('4.7 Tutor Ratings, Reviews & Testimonials');
bullet('Functional Flow', 'Learners rate verified tutors from 1 to 5 stars and leave written testimonials. Tutor average rating updates automatically.');
bullet('Technical Aspect', 'POST /api/v1/reviews validates that attendance was completed, then re-aggregates the tutor average rating in PostgreSQL.');

subheader('4.8 Academic Material Sharing Hub');
bullet('Functional Flow', 'Students upload and download past examination papers, lecture notes, and cheat-sheets categorized by course code. Max size 10MB.');
bullet('Technical Aspect', 'POST /api/v1/materials/upload checks MIME types (strictly PDF, DOCX, PNG, JPG) and stores files safely with download counters.');

subheader('4.9 Student Safety & Conduct Reporting');
bullet('Functional Flow', 'Students can report inappropriate conduct or missed meetups with one click for administrative review.');
bullet('Technical Aspect', 'POST /api/v1/reports creates moderation records with reporter ID, reported ID, reason, and status flags.');

// PAGE 4: DATABASE SCHEMA & DEPLOYMENT
doc.addPage();
header('5. Database Schema & Data Dictionary');
para('All tables inherit UUID primary keys and timestamp tracking from BaseEntity:');

const tables = [
  ['users', 'id, email, password, role, department, level, coursesToTeach, coursesNeedingHelp, rating, isVerified'],
  ['courses', 'id, code (e.g. MTH102), title, department, level'],
  ['topics', 'id, courseId (FK), title (e.g. Integration), difficulty'],
  ['tutoring_sessions', 'id, tutorId (FK), courseId (FK), sessionType, locationVenue, meetingUrl, scheduledAt, status'],
  ['session_participants', 'id, sessionId (FK), learnerId (FK), attended (Boolean)'],
  ['study_partner_matches', 'id, studentAId (FK), studentBId (FK), courseId (FK), status (ACTIVE/RESHUFFLED)'],
  ['materials', 'id, uploaderId (FK), courseId (FK), title, fileUrl, fileType, downloadsCount'],
  ['reviews', 'id, sessionId (FK), tutorId (FK), learnerId (FK), rating (1-5), testimonial'],
  ['reports', 'id, reporterId (FK), reportedUserId (FK), reason, description, status (PENDING/RESOLVED)'],
];

tables.forEach(([tbl, cols]) => {
  doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text(`• ${tbl}: `, { continued: true });
  doc.fillColor(BODY).fontSize(8.5).font('Helvetica').text(cols);
  doc.moveDown(0.2);
});

header('6. Security & Standardized Envelope Architecture');
bullet('Response Envelope', 'All successful responses are structured as { success: true, statusCode, message, data, timestamp }.');
bullet('Exception Filter', 'All errors are returned uniformly as { success: false, statusCode, message, path, timestamp }.');
bullet('Rate Limiting', 'OTP requests limited to 1 per 60s per IP; login attempts capped at 5 per 15 minutes to prevent brute-force attacks.');

header('7. Cloud Deployment Guide (Render.com)');
bullet('Step 1: Managed PostgreSQL', 'Create a free PostgreSQL instance on Render named study-connect-db and copy the connection credentials.');
bullet('Step 2: Web Service', 'Connect the GitHub repository to Render as a Node Web Service using build command: npm install && npm run build.');
bullet('Step 3: Environment Configuration', 'Set PORT=3000, NODE_ENV=production, database credentials, JWT_SECRET, and RESEND_API_KEY.');
bullet('Step 4: Live Verification', 'Verify health at /api/v1/health and interact with the live Swagger playground at /docs.');

doc.end();

writeStream.on('finish', () => {
  console.log('PDF created successfully at: ' + outputPath);
});
