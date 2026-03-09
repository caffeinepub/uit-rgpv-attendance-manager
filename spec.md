# UIT RGPV Electrical Department - Attendance Management System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Role-based access: Admin (HOD/Faculty) and Student login
- Admin dashboard:
  - Manage students (add, edit, delete) with details: name, enrollment number, semester, section
  - Manage subjects per semester
  - Mark attendance for a subject/class session (date, subject, section, semester) — bulk marking (present/absent per student)
  - View attendance records with filters (student, subject, date range, semester)
  - Generate attendance summary per student per subject (attendance percentage)
  - Flag students below 75% attendance threshold
- Student dashboard:
  - View own attendance per subject
  - See overall attendance percentage
  - See subjects where attendance is below 75%
- Department branding: UIT RGPV Bhopal, Electrical Engineering Department

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - Data models: Student, Subject, AttendanceRecord, User (faculty/student)
   - CRUD for students and subjects
   - Mark attendance for a session (list of student IDs + present/absent)
   - Query attendance by student, subject, date, semester
   - Compute attendance percentage per student per subject
   - Role-based authorization (admin vs student)

2. Frontend (React + TypeScript):
   - Login page (role selection: faculty/student, credentials)
   - Admin layout with sidebar navigation
   - Students management page (table with add/edit/delete)
   - Subjects management page
   - Mark Attendance page (select subject/date/section, mark each student)
   - Attendance Records page (filterable table)
   - Attendance Summary page (percentage per subject, highlight < 75%)
   - Student dashboard (own attendance summary)
   - UIT RGPV branding in header/navbar
