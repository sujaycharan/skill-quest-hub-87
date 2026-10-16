# Add a Real Admin Account

## Goal
Give you a secure admin login with its own admin area, separate from regular user accounts.

## What will be built

### 1. Roles in the database (secure, server-checked)
- New `user_roles` table storing which user has which role (`admin` / `user`) — roles are never stored on the profile, so they can't be faked from the browser.
- A `has_role()` database function that pages use to verify admin status securely.
- Row-level security so only admins can read admin-only data.

### 2. Admin area in the app
- New `/admin` page, visible only to admin accounts. Non-admins are redirected away.
- Admin dashboard showing: total users, list of users (name, email, career goal, onboarding status), and per-user progress (topics completed).
- An "Admin" link appears in the header only when signed in as an admin.

### 3. Creating your admin account
- You sign up (or use your existing account), then I assign the `admin` role to your user in the database.
- Login stays the same email + password form — after login, admins see the Admin link.

## Technical details
- Migration: `app_role` enum, `public.user_roles` table (FK to `auth.users`, cascade), GRANTs (`authenticated` SELECT, `service_role` ALL), RLS enabled, `has_role(uuid, app_role)` security-definer function, plus admin SELECT policies on `profiles`/`topics`/`learning_paths` so admins can view all users' data.
- Frontend: `src/routes/admin.tsx` guarded by a `has_role` check via Supabase RPC; header shows Admin link conditionally.
- After the build, you tell me which email should be admin and I assign the role.

## What I need from you
- The email address of the account that should become admin (you can confirm after the build).
