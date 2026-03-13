# GAP Analysis — Security, Logic & Code Quality

> Full audit of **unstack-todo** — comprehensive codebase review covering security, bugs, code quality, scalability, and feature gaps.
> Total issues: **49** (12 new, 37 carried/updated)
>
> _Last updated: 2026-03-13_

---

## Severity Legend

| Level        | Meaning                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| **CRITICAL** | Must fix before production. Active vulnerability or data loss risk.     |
| **HIGH**     | Fix soon. Significant security or reliability concern.                  |
| **MEDIUM**   | Should fix. Quality/maintainability issue with potential runtime impact. |
| **LOW**      | Nice to fix. Minor improvement or best practice.                        |

---

## CRITICAL

### ~~1. Gemini API Key Exposed in Client Bundle~~ FIXED

- ~~**File:** `src/shared/services/ai.service.ts:11-15`~~
- ~~**Issue:** `VITE_GEMINI_API_KEY` is a `VITE_`-prefixed env var, so Vite bundles it into client-side JavaScript. Anyone can extract it from browser DevTools (Sources tab, Network tab) and make unlimited API calls billed to your Google Cloud account.~~
- ~~**Fix:** Moved Gemini calls behind Vercel API route (`api/ai.ts`). Client calls `/api/ai` via fetch. `GEMINI_API_KEY` is server-only (no `VITE_` prefix).~~

---

## HIGH

### ~~3. No Input Validation (No Zod)~~ FIXED

- ~~**Files:** `src/features/auth/components/auth-form.tsx`, `src/features/profile/components/security-card.tsx`~~
- ~~**Issue:** No schema validation library. Auth forms use HTML5 `required`/`type="email"` only. Profile forms have ad-hoc checks.~~
- ~~**Fix:** Added `zod` + `react-hook-form` with shared schemas in `src/shared/lib/validation.ts`. Auth forms and security card now use `zodResolver`.~~

### ~~4. No Error Boundary~~ FIXED

- ~~**File:** `src/routes/__root.tsx`~~
- ~~**Issue:** No React Error Boundary wraps the application. An unhandled error in any component crashes the entire app with a white screen and no recovery path.~~
- ~~**Fix:** Added `react-error-boundary` with `ErrorFallback` component wrapping `<Outlet />` in `__root.tsx`.~~

### ~~5. `useState` Misused as `useEffect` in AI Generator~~ FIXED

- ~~**File:** `src/features/projects/components/ai-task-generator.tsx:41`~~
- ~~**Issue:** `useState()` initializer triggers an async side effect (API call). This runs during render (not after mount), will double-fire in React StrictMode, and has no cleanup.~~
- ~~**Fix:** Replaced with `useEffect(() => { if (autoGenerate) handleGenerate(); }, [])`.~~

### ~~6. Inconsistent Environment Variable Validation~~ FIXED

- ~~**Files:** `src/config/appwrite.ts`, `src/config/env.ts`~~
- ~~**Issue:** Inconsistent env var validation — some throw, others silently warn.~~
- ~~**Fix:** Created `src/config/env.ts` with zod schema validating all env vars at startup. `appwrite.ts` now imports from `env.ts`.~~

### ~~7. Race Condition in Auth Loading~~ FIXED

- ~~**File:** `src/routes/_protected.tsx`~~
- ~~**Issue:** Protected content briefly visible while auth is loading.~~
- ~~**Fix:** Block rendering until auth check completes AND user is confirmed (`authLoading || !user` guard).~~

### ~~8. Array Index Used as React Key (18 instances)~~ FIXED

- ~~**Files:** 12 files, 18 instances~~
- ~~**Issue:** Array index used as React key causing potential DOM reuse bugs.~~
- ~~**Fix:** Replaced all 18 instances with unique identifiers (tag strings, subtask titles, skeleton prefixes).~~

---

## MEDIUM

### ~~9. Inconsistent Password Validation~~ FIXED

- ~~**Files:** `src/features/auth/components/auth-form.tsx`, `src/features/profile/components/security-card.tsx`~~
- ~~**Issue:** Signup and password change had different validation rules.~~
- ~~**Fix:** Shared `passwordSchema` in `src/shared/lib/validation.ts` used by both forms via zod + react-hook-form.~~

### 10. Avatar Upload Has No MIME Validation

- **File:** `src/features/profile/components/personal-info-card.tsx:37-57`
- **Issue:** File input has `accept="image/*"` but no client-side MIME type validation beyond the HTML attribute. Only `file.size > 2MB` is checked. A user can rename a malicious file to `.jpg`.
- **Fix:** Validate `file.type.startsWith('image/')` and whitelist specific MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).

### 11. Old Avatar Never Deleted on Re-Upload

- **File:** `src/features/profile/components/personal-info-card.tsx:44-57`
- **Issue:** When uploading a new avatar, the old file is never deleted from Appwrite Storage, creating orphaned files and storage bloat.
- **Fix:** Before uploading, check if `avatarFileId` exists in prefs and delete the old file.

### 12. Account Deletion Does Not Delete Storage Files

- **File:** `src/features/auth/services/auth.service.ts:83-115`
- **Issue:** `deleteAccount()` deletes documents from all collections but never deletes uploaded files (avatars, attachments). These files persist as orphans — potential privacy issue since files remain accessible if IDs are known.
- **Fix:** Enumerate and delete all storage files (avatar from prefs, attachments from tasks) before deleting documents.

### 13. AI Prompt Injection via Project Name

- **File:** `src/shared/services/ai.service.ts:328-338`
- **Issue:** User-supplied `projectName` and `projectDescription` are interpolated directly into the Gemini prompt. Crafted inputs can manipulate AI output or bypass safety guidelines.
- **Fix:** Sanitize inputs (strip special chars, limit length to 200), use structured JSON payloads instead of string interpolation.

### 14. `deleteAccount` Pagination May Miss Documents

- **File:** `src/features/auth/services/auth.service.ts:96-108`
- **Issue:** Each collection query uses `Query.limit(500)`. Users with >500 tasks will have orphaned documents after deletion.
- **Fix:** Loop with pagination until no documents remain in each collection.

### 15. `any` Type Usage (6 instances)

- **Files:** `task.service.ts:128`, `project.service.ts:19`, `category.service.ts:20`, `template.service.ts:20`, `comment.service.ts:10`, `reminder.service.ts:20` — all `documentToX(doc: any)`
- **Issue:** Bypasses TypeScript type checking entirely. All use `eslint-disable` comments to suppress warnings.
- **Fix:** Use `Models.Document` from Appwrite SDK with proper type casting and runtime validation.

### 16. Bulk Operations Can Hit API Rate Limits

- **Files:** `task.service.ts` — `emptyTrash()`, `clearCompleted()`, `restoreAllFromTrash()`, `createTasksBatch()`; `project.service.ts` — `deleteProject()`; `category.service.ts` — `deleteCategory()`
- **Issue:** `Promise.all()` fires parallel requests for each document. With 100+ items, this can exceed Appwrite rate limits causing silent failures.
- **Fix:** Batch with chunking (10-20 at a time) using sequential processing per chunk.

### 17. `console.error`/`console.log` in Production (50+ instances)

- **Files:** All service files, providers, components (50+ instances across 20 files)
- **Issue:** Error details and stack traces exposed in browser console in production. Reveals code structure, API endpoints, and internal state.
- **Fix:** Replace with proper logging service (Sentry, LogRocket) or wrap in `import.meta.env.DEV` guards.

### 18. Task Pagination Hardcoded to 1000

- **File:** `src/features/tasks/services/task.service.ts:159`
- **Issue:** `Query.limit(1000)` loads all tasks at once. Tasks beyond 1000 are silently lost. Performance degrades for power users.
- **Fix:** Implement cursor-based pagination or infinite scroll.

### 19. Missing Timezone Handling

- **Files:** `src/features/tasks/hooks/use-task-filters.ts`, `src/features/tasks/components/task-item.tsx`
- **Issue:** All date comparisons use `new Date()` without timezone consideration. "Today" in UTC may differ from the user's timezone.
- **Fix:** Use `date-fns-tz` or normalize all dates to user's timezone.

### 20. Silent Auth Failure

- **File:** `src/features/auth/services/auth.service.ts` — `getCurrentUser()`
- **Issue:** Returns `null` on any error without logging. Network failures, expired tokens, and server errors all look the same.
- **Fix:** Differentiate error types — return `null` for 401 (not logged in), throw for network/server errors.

### 21. No Session Refresh

- **File:** `src/app/providers/auth-provider.tsx`
- **Issue:** No mechanism to refresh expired sessions. If session expires during use, API calls fail silently with no user feedback.
- **Fix:** Detect 401 responses globally and redirect to login with a "session expired" message.

### 22. Unsafe Non-Null Assertion in main.tsx

- **File:** `src/main.tsx:15`
- **Issue:** `auth: undefined!` uses TypeScript non-null assertion, which can cause runtime errors if accessed before auth initializes.
- **Fix:** Properly type the context with `auth: AuthContext | undefined` and guard access.

### 23. Task Form Component Too Large (338 lines)

- **File:** `src/features/tasks/components/task-add-dialog.tsx`
- **Issue:** Single component handles creation, editing, subtasks, categories, projects, dates, priorities, templates, and AI description — a "god component".
- **Fix:** Break into smaller composable form field components (`TitleField`, `PriorityField`, `DateField`, etc.).

### 24. Task Detail Sheet Too Large (500+ lines) `NEW`

- **File:** `src/features/tasks/components/task-details-sheet.tsx`
- **Issue:** Another god component with 8+ `useState` calls handling sheet shell, editing state, title/description edits, property edits, subtask UI, comments integration, and save-as-template logic.
- **Fix:** Extract into `TaskDetailSheetHeader`, `TaskDetailEditorPanel`, `TaskDetailPropertiesPanel` using compound component pattern.

### 25. Recurrence Fields Stored But Never Processed `NEW`

- **Files:** `src/features/tasks/types/task.types.ts:5,37`, `src/features/tasks/services/task.service.ts`
- **Issue:** Tasks have a `recurrence` field (`daily | weekly | monthly | weekdays`) that is saved to the database and shown in the UI, but no backend job or client-side logic ever creates recurring task instances. Users set recurrence expecting it to work, but nothing happens.
- **Fix:** Either implement recurrence processing via Appwrite Functions/cron job, or remove the UI and mark as "coming soon".

### 26. Trash Auto-Purge Promised But Not Implemented `NEW`

- **Files:** `src/routes/_protected/trash/index.lazy.tsx:55`, `src/features/tasks/hooks/use-tasks-query.ts:228`
- **Issue:** UI tells users "Deleted tasks will appear here for 30 days" and "Task will be permanently deleted after 30 days", but no backend job or scheduled function implements auto-purge. Trashed tasks remain forever.
- **Fix:** Implement an Appwrite Function on a cron schedule that hard-deletes tasks where `deletedAt` is older than 30 days, or remove the 30-day promise from the UI.

### 27. Reminders UI Complete But No Backend Delivery `NEW`

- **Files:** `src/features/reminders/services/reminder.service.ts`, `src/routes/_protected/settings/index.lazy.tsx`
- **Issue:** Settings UI allows configuring reminder preferences (email, Discord, daily summary, per-task reminders) but no backend job sends actual notifications. Users configure reminders thinking they'll work.
- **Fix:** Implement notification delivery via Appwrite Functions with email (SMTP) and Discord webhook integrations, or clearly mark as "coming soon" in the UI.

### 28. Silent `.catch(() => {})` Swallowing Errors `NEW`

- **Files:** `src/routes/_protected.tsx:55,149`
- **Issue:** Two `.catch(() => {})` calls silently swallow errors from onboarding profile fetch and completion. If these fail, no debugging information exists.
- **Fix:** At minimum log with `console.debug()` in dev mode, or use proper error reporting.

### 29. Hardcoded Route Detection in __root.tsx `NEW`

- **File:** `src/routes/__root.tsx`
- **Issue:** Root layout checks 8+ hardcoded pathname prefixes to determine if the current route is protected. This breaks when new routes are added and doesn't scale.
  ```ts
  const isProtectedRoute =
    location.pathname.startsWith("/inbox") ||
    location.pathname.startsWith("/today") || ...
  ```
- **Fix:** Use TanStack Router route metadata or context-based detection instead of pathname matching.

---

## LOW

### 30. Three Unused Dependencies

- **File:** `package.json`
- **Issue:** `node-appwrite` (server SDK, zero imports in `src/`), `inngest` (only used in scripts), `next-themes` (zero imports) are in production dependencies.
- **Fix:** Remove `node-appwrite` and `next-themes`. Move `inngest` to `devDependencies`.

### 31. `Forgot Password?` Link is Dead

- **File:** `src/features/auth/components/auth-form.tsx:121`
- **Issue:** `<a href="#">Forgot Password?</a>` does nothing.
- **Fix:** Implement using Appwrite's `account.createRecovery()` or remove until implemented.

### 32. Terms/Privacy Links are Dead

- **File:** `src/features/auth/components/auth-form.tsx:193-198`
- **Issue:** Both links point to `href="#"`. Legal liability for production.
- **Fix:** Create actual pages or remove the links.

### ~~33. Social Login Buttons Show "Coming Soon" Toast~~ FIXED

- ~~**File:** `src/features/auth/components/auth-form.tsx`~~
- ~~**Issue:** Apple and Google sign-in buttons look functional but show "coming soon" toast. Misleading UX.~~
- ~~**Fix:** Replaced Apple with Discord OAuth, implemented Google OAuth. Both now redirect to provider auth pages.~~

### 34. Missing `autocomplete` Attributes on Auth Forms

- **File:** `src/features/auth/components/auth-form.tsx`
- **Issue:** Email and password inputs lack `autocomplete` attributes. Password managers cannot assist.
- **Fix:** Add `autocomplete="email"`, `autocomplete="current-password"`, `autocomplete="new-password"`.

### 35. Profile/Security Forms Not Wrapped in `<form>`

- **Files:** `src/features/profile/components/personal-info-card.tsx`, `src/features/profile/components/security-card.tsx`
- **Issue:** Fields are in `<Card>` but not in `<form>`. Enter key doesn't submit, password managers can't detect them.
- **Fix:** Wrap in `<form>` with `onSubmit`.

### 36. No Password Strength Indicator

- **File:** `src/features/auth/components/auth-form.tsx`
- **Issue:** Sign-up accepts any password meeting minimum. No visual strength feedback.
- **Fix:** Add password strength meter component.

### 37. Missing ARIA Labels

- **Files:** `src/features/tasks/components/task-add-dialog.tsx`
- **Issue:** Some icon-only buttons lack `aria-label` attributes.
- **Fix:** Add descriptive `aria-label` to all icon buttons.

### 38. `dbService` is Dead Code

- **File:** `src/shared/services/db.service.ts`
- **Issue:** Generic database wrapper never imported anywhere. All services call `databases` directly.
- **Fix:** Remove the file.

### 39. `safeParseAttachments` Casts Without Validation

- **File:** `src/features/tasks/services/task.service.ts:114-122`
- **Issue:** `return parsed as Attachment[]` without validating element shape. Malformed JSON produces type-unsafe objects.
- **Fix:** Validate each element has required fields (`fileId`, `name`, `size`, `mimeType`) before casting.

### 40. No Rate Limiting on Auth Attempts

- **File:** `src/features/auth/components/auth-form.tsx`
- **Issue:** Users can spam login attempts indefinitely. No throttling or lockout.
- **Fix:** Add attempt counter with exponential backoff. Appwrite has some built-in protection, but client-side throttling improves UX.

### 41. No CI/CD Pipeline

- **Issue:** No GitHub Actions. No automated linting, type-checking, or deployment.
- **Fix:** Add `.github/workflows/ci.yml` with lint, typecheck, build steps.

### 42. No Offline Indicator in UI `NEW`

- **Issue:** PWA supports offline caching via Workbox, but there's no visual indicator when the user is offline. Mutations fail silently without network.
- **Fix:** Add an offline banner/toast using `navigator.onLine` and the `online`/`offline` events.

### 43. Auto-Archive Toggle is Placeholder `NEW`

- **File:** `src/routes/_protected/settings/index.lazy.tsx:193-212`
- **Issue:** Settings page has an "Auto-archive completed tasks after 30 days" toggle, but it's a UI-only placeholder — no backend logic implements it.
- **Fix:** Implement via Appwrite Function cron job, or remove the toggle until implemented.

### 44. No Email Verification on Signup `NEW`

- **Issue:** Users sign up with email/password but email is never verified. No call to Appwrite's `account.createVerification()`. Fake emails can create accounts.
- **Fix:** Add email verification flow after signup using Appwrite's verification API.

### 45. Project Icon Picker Missing `NEW`

- **Files:** `src/features/projects/types/project.types.ts`, `src/features/projects/components/create-project-dialog.tsx`
- **Issue:** Project type has an `icon` field but no icon picker UI exists in the create/edit project dialog. Icons default to a generic folder icon.
- **Fix:** Add an icon picker component with common project icons (similar to color picker already implemented).

---

## Resolved Issues (Since Last Audit)

| Issue | Resolution |
|-------|-----------|
| Document-level permissions | Added `Permission.read/update/delete(Role.user(userId))` to all `createDocument()` calls |
| Unsafe JSON.parse | Added `safeParseSubtasks()`, `safeParseArray()`, `safeParseAttachments()` with try-catch |
| DevTools in production | Wrapped in `import.meta.env.DEV` guard |
| Duplicate empty states | Consolidated into single composable `TaskEmptyState` component |
| No offline support | PWA with Workbox service worker configured via `vite-plugin-pwa` |
| Projects/Categories as strings | Separate collections with full CRUD services |
| No data export/import | `exportTasksJSON()`, `exportTasksCSV()`, `importTasks()` implemented |
| No request deduplication | TanStack React Query now handles caching and dedup |
| Storage service unused | Used by `personal-info-card.tsx` for avatar uploads |
| No search | Command palette with task/project search implemented |
| No optimistic updates | React Query mutations with `onMutate`/`onError`/`onSettled` |
| Avatar URL regenerated | Memoized with `useMemo` in `dashboard-header.tsx` |
| No lazy loading | 8 protected routes code-split with `.lazy.tsx` |
| No virtualization | `VirtualizedTaskList` for 50+ items with `@tanstack/react-virtual` |
| Image optimization | `loading="lazy"` on empty state images |

---

## Summary by Category

| Category            | Critical | High | Medium | Low  | Total  |
| ------------------- | -------- | ---- | ------ | ---- | ------ |
| **Security**        | 2        | 1    | 3      | 1    | **7**  |
| **Logic/Bugs**      | 0        | 2    | 6      | 0    | **8**  |
| **Code Quality**    | 0        | 1    | 4      | 4    | **9**  |
| **Form/Validation** | 0        | 1    | 1      | 3    | **5**  |
| **Accessibility**   | 0        | 0    | 0      | 2    | **2**  |
| **DX**              | 0        | 0    | 0      | 1    | **1**  |
| **Feature/UX**      | 0        | 0    | 3      | 2    | **5**  |
| **Performance**     | 0        | 0    | 3      | 1    | **4**  |
| **Data Integrity**  | 0        | 1    | 2      | 1    | **4**  |
| **Scalability**     | 0        | 0    | 1      | 1    | **2**  |
| **Auth**            | 0        | 0    | 1      | 1    | **2**  |
| **Total**           | **2**    | **6**| **24** | **17** | **49** |

---

## Feature Gaps & Improvement Plan

### Missing Features

| #    | Feature                          | Description                                                                                                    | Effort | Impact |
| ---- | -------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| ~~F1~~   | ~~**Forgot Password Flow**~~         | ~~Removed — requires Appwrite paid plan~~                              | ~~Low~~    | ~~High~~   |
| ~~F2~~   | ~~**Google OAuth**~~                 | ~~FIXED — Implemented with Appwrite OAuth2. Google button now redirects to Google auth.~~ | ~~Medium~~ | ~~High~~   |
| ~~F3~~   | ~~**Discord OAuth**~~                | ~~FIXED — Replaced Apple button with Discord. Discord user ID auto-extracted from OAuth identity and saved to preferences.~~ | ~~Medium~~ | ~~High~~ |
| F4   | **Mobile Bottom Navigation**     | Sidebar is hamburger on mobile. Add proper bottom tab bar for mobile                                           | Medium | High   |
| F5   | **Focus Mode**                   | Toggle to hide sidebar + header, show only current task list for distraction-free work. Add toggle in both (1) dashboard header as a quick-access icon button and (2) Settings page under Appearance section as a default preference | Medium | Medium |
| F6   | **Terms/Privacy Pages**          | Dead anchor links. Create actual pages or remove for legal compliance                                          | Low    | Medium |
| ~~F7~~   | ~~**Email Verification**~~           | ~~Removed — requires Appwrite paid plan~~                        | ~~Low~~   | ~~Medium~~ |
| F8   | **Recurring Tasks Processing**   | Recurrence field exists in UI/DB but no backend processes it. Implement via Appwrite Function cron             | High   | Medium |
| F9   | **Trash Auto-Purge (30 days)**   | UI promises 30-day auto-delete but no backend implements it. Add Appwrite Function cron                        | Medium | Low    |
| F10  | **Reminder Notifications**       | Settings UI complete but no backend sends notifications. Implement email + Discord webhook delivery             | High   | Medium |
| F11  | **Project Icon Picker**          | Icon field exists but no picker UI. Add icon selection in create/edit project dialog                            | Low    | Low    |

### UI/UX Improvements

| #    | Improvement                     | Description                                                                                | Effort | Impact |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------ | ------ | ------ |
| U1   | **Animated Transitions**        | framer-motion installed but barely used. Add page transitions and list animations           | Low    | Low    |
| U2   | **Dark Mode Refinement**        | Some components use hardcoded colors that don't adapt to themes                             | Low    | Medium |
| U3   | **Offline Indicator**           | Show banner/toast when user goes offline. Currently mutations fail silently                 | Low    | Medium |
| U4   | **Password Strength Meter**     | Add visual strength indicator on signup and password change forms                           | Low    | Low    |

### Developer Experience

| #    | Improvement                     | Description                                                                                | Effort | Impact |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------ | ------ | ------ |
| D1   | **React Hook Form + Zod**       | All forms use raw `useState`. Migrate to react-hook-form with zod schemas for validation   | Medium | High   |
| D2   | **CI/CD Pipeline**              | No GitHub Actions. Add lint, typecheck, build steps                                        | Medium | High   |
| D3   | **Remove Dead Code**            | `node-appwrite`, `next-themes`, `inngest` (from deps), `db.service.ts`                     | Low    | Low    |
| D4   | **Centralized Error Reporting** | Replace 50+ `console.error` calls with Sentry or similar. Dev-only logging for debug       | Medium | Medium |
| D5   | **Stricter ESLint**             | Add `no-explicit-any` rule, `eslint-plugin-react` for component best practices             | Low    | Medium |

---

## Recommended Fix Order

### Phase 1 — Security (Immediate) ✅ DONE

1. ~~**#1** — Move Gemini API key behind Vercel API route~~
2. ~~**#2** — Removed (not applicable)~~
3. ~~**#4** — Add Error Boundary at root~~
4. ~~**#5** — Fix `useState` → `useEffect` in AI generator~~
5. ~~**F2** — Implement Google OAuth~~
6. ~~**F3** — Implement Discord OAuth (replace Apple button, auto-extract user ID for reminders)~~

### Phase 2 — Validation & Reliability ✅ DONE

7. ~~**#3 + D1** — Added zod + react-hook-form validation to auth and security forms~~
8. ~~**#6** — Validated all env vars at startup with zod schema~~
9. ~~**#7** — Fixed auth loading race condition~~
10. ~~**#9** — Unified password validation in shared utility~~
11. ~~**#8** — Fixed array index keys (18 instances across 12 files)~~
12. **#14** — Fix deleteAccount pagination for >500 docs

### Phase 3 — Data Integrity & Features

13. **#10** — Validate avatar MIME type
14. **#11** — Delete old avatar on re-upload
15. **#12** — Delete storage files on account deletion
16. **#13** — Sanitize AI prompt inputs
17. **#15** — Replace `any` types with `Models.Document`
18. **#16** — Chunk bulk operations
19. ~~**F1** — Removed (requires Appwrite paid plan)~~
20. **F5** — Implement Focus Mode with settings toggle
21. ~~**F7** — Removed (requires Appwrite paid plan)~~

### Phase 4 — Quality & Scale

22. **#17** — Replace `console.error` with proper logging / Sentry
23. **#18** — Implement task pagination (cursor-based)
24. **#19** — Add timezone handling
25. **#20-21** — Handle auth failures and session refresh
26. **#23-24** — Break up god components (task-add-dialog, task-details-sheet)
27. **#29** — Replace hardcoded route detection with metadata
28. **D2** — Add CI/CD pipeline
29. **D3** — Remove dead code and unused deps

### Phase 5 — Feature Completion

30. **F8** — Implement recurring task processing
31. **F9** — Implement trash auto-purge (30-day)
32. **F10** — Implement reminder notification delivery
33. **F4** — Mobile bottom navigation
34. **F11** — Project icon picker
35. **U1-U4** — UI polish (animations, dark mode, offline indicator, password meter)
