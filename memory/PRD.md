# PRD — SS NEXORA TECH Business Website

## Original Problem Statement
Business website for company "SS NEXORA TECH" (with company logo) providing courses and internships. Pages: Home, About Us, Courses, Internships, Feedback, Media, Contact Us — all managed by admin (add courses, internships, media, approve feedback). Users can login/register. Admin login: gopichnadunukala@gmail.com / Sipayi@143. Everything controlled by admin. NO sample/dummy data — admin adds all content. User wants custom domain (ssnexoratech.com — to be bought at a registrar and linked after deployment).

## User Choices
- JWT-based custom auth (Google login noted for later)
- Users can enroll in courses & apply for internships
- Media: images + YouTube videos
- Feedback: logged-in users submit → admin approval → public
- Design: Modern Glassmorphism (dark, blue/cyan, matching logo)

## Architecture
- FastAPI + MongoDB (motor) backend, all routes under /api
- React 19 frontend, framer-motion + lenis + react-fast-marquee, shadcn/ui, sonner toasts
- JWT bearer auth (token in localStorage `nexora_token`), bcrypt hashing, admin seeded on startup
- Logo asset: https://customer-assets-eiarnc6j.emergentagent.net/job_98f20b1c-aded-48d2-adc1-6e43bd96e549/artifacts/wcoxhf9m_company%20logo.jpeg

## User Personas
- Visitor: browses pages, submits contact form
- Registered user: enrolls in courses, applies for internships, submits feedback
- Admin: full control — CRUD courses/internships/media, feedback moderation, enrollment/application status, view messages & users

## Implemented (June 2026 — MVP)
- All 7 public pages with Awwwards-level glassmorphism design (kinetic hero, masked reveal, marquee, manifesto chapters, parallax)
- JWT auth: register, login, /me; admin role; brute-force-safe bcrypt
- Admin dashboard (/admin): Overview stats, Courses/Internships/Media CRUD dialogs, Feedback approve/reject, Enrollments & Applications status management, Contact messages (read/delete), Users list
- User flows: enroll, apply, feedback (approval-gated), contact
- Tested: 26/26 backend tests + full frontend E2E passed (iteration_1)
- Test data cleaned; DB starts empty except admin user
- Admin credentials changed to ssnexoratech.19@gmail.com / Sipayi@143 (old admin removed)
- Site Settings tab in admin: contact email/phone/address, home hero lines + tagline + stats (4: enrolled students, real projects, course completions, internship completions), About Us mission/vision/story — used by Contact page, Footer, Home hero, About page
- Separate Admin Portal: /admin/login (admin-only login), admin area has own header (View Website + Logout), public navbar/footer hidden in admin area
- Feedback nav link visible only to logged-in users; navbar shows single "Admin Panel" button for admins

## Backlog
- P1: Google social login (user mentioned it as option)
- P1: Forgot/reset password flow
- P2: Email notifications (enrollment/application confirmations) — needs Resend/SendGrid key
- P2: File upload for resumes / media images (object storage) instead of URLs
- P2: Payment integration for paid courses (Stripe/Razorpay)
- P2: Editable About Us content from admin

## Next Tasks
- Deploy, then connect custom domain (buy ssnexoratech.com at registrar, remove A records, link in Emergent deployment settings)
