# Complete Onboarding Flow Test Guide

**Date:** March 2, 2026  
**Status:** Ready for testing  
**Dev Server:** http://localhost:3000

---

## Complete Flow Overview

```
[Sign Up Page] → [Supabase Auth] → [Redirect to /dashboard] 
    ↓
[Middleware checks role]
    ↓
[No role found - Redirect to /onboarding/role]
    ↓
[Role Selection Page]
    ↓
[Select Client or Pro]
    ↓
[setMyRole action updates database]
    ↓
[Redirect to Dashboard (client) or Pro Dashboard (pro)]
```

---

## Step 1: Sign Up

### What to Do
1. Go to http://localhost:3000/sign-up
2. Click "Sign up" tab (should be default)
3. Fill in email and password
4. Click "Sign up with Email"

### Expected Console Logs
```
[SupabaseAuthCard] Auth state changed: INITIAL_SESSION <user-id>
[SupabaseAuthCard] Auth state changed: SIGNED_IN <user-id> (may show different ID)
[SupabaseAuthCard] User signed in: <user-id>
[SupabaseAuthCard] Initializing profile for new user
[SupabaseAuthCard] Profile initialized successfully: {success: true}
[SupabaseAuthCard] Redirecting to dashboard...
```

### Expected Behavior
- After signing up, page should redirect to /dashboard
- You should see a navigation header with your initial "U"
- A brief loading indicator may appear

### Possible Issues
```
❌ "User signed up but stayed on /sign-up page"
   → SupabaseAuthCard redirect not working
   → Check console for redirect logs

❌ "SIGNED_IN event didn't fire"
   → Supabase auth session issue
   → Check browser cookies for sb-*-auth-token

❌ "Profile initialization failed"
   → Database error during profile creation
   → Check server logs for [setMyRole] errors
```

---

## Step 2: Role Selection (Middleware Redirect)

### What Happens Automatically
After signing up, middleware intercepts the redirect to /dashboard:
1. Middleware checks if user has a role
2. User has no role (just created profile)
3. Middleware redirects to /onboarding/role
4. User is now at role selection page

### Expected Console Logs
```
[Header] Current user: <user-id>
[Header] Auth state changed: SIGNED_IN <user-id>
[Header] User signed in/updated
[BottomNav] Current user: <user-id>
[BottomNav] Auth state changed: SIGNED_IN <user-id>
[BottomNav] User signed in/updated
```

### Expected Page Behavior
- Title: "Welcome to FundiGuard"
- Subtitle: "What's your role?"
- Two buttons: "I'm a Client" and "I'm a Pro"
- Top navigation should show "FundiGuard" logo and your profile "U" button
- Bottom mobile nav should show Profile link

### Possible Issues
```
❌ "Stuck on /dashboard (infinite redirect)"
   → Middleware might not be checking role properly
   → Check middleware.ts role gating logic

❌ "Role page still shows spinner"
   → Middleware auth check failing
   → Verify user session is valid

❌ "Missing 'U' profile button in header"
   → Auth listener in Header not firing
   → Check [Header] logs
```

---

## Step 3: Select Role

### What to Do
1. Click "I'm a Client" button (or "I'm a Pro" for the pro flow)

### Expected Console Logs
```
[setMyRole] Setting role for user: <user-id> role: client
[setMyRole] Role updated successfully for user: <user-id>
```

### Expected Behavior
- Button click triggers server action
- Server updates role in profiles table
- Page redirects based on role

### Form Data Sent
```
FormData:
  role: "client" or "pro"
```

### Possible Issues
```
❌ "500 error after clicking role button"
   → Server action failing
   → Check console for [setMyRole] Database error logs
   → Error details will show in console

❌ "Button doesn't respond to click"
   → Client JavaScript error
   → Check browser console for errors

❌ "Role saved but redirect doesn't happen"
   → Redirect logic in setMyRole failing
   → Check server logs for redirect error
```

---

## Step 4: Complete & Dashboard

### If Selected "Client"
**Expected Redirect:** /dashboard  
**Expected Page:** Client Dashboard  
**Expected Console Logs:**
```
[Header] Auth state changed: SIGNED_IN <user-id>
[Header] User signed in/updated
GET /dashboard 200 in <time>ms
```

### If Selected "Pro"
**Expected Redirect:** /pro-dashboard  
**Expected Page:** Pro Dashboard  
**Expected Console Logs:**
```
GET /pro-dashboard 200 in <time>ms
```

### Expected Page Content
- Page should load successfully (200 status)
- Navigation should update
- For client: Browse jobs, Post a job (visible in nav)
- For pro: Post a job (likely disabled or different)

### Possible Issues
```
❌ "Redirect to wrong dashboard"
   → Middleware might be overriding redirect
   → Check middleware role checking logic

❌ "404 on dashboard page"
   → Page file might be missing or corrupted
   → Verify src/app/dashboard/page.tsx exists

❌ "Dashboard loads but shows 0 content"
   → Dashboard component might have issues
   → Check component rendering
```

---

## Console Log Reference

### All Expected Logs (In Order)

```
=== SIGN UP ===
[SupabaseAuthCard] Auth state changed: INITIAL_SESSION undefined
[Header] Current user: undefined
[Header] Auth state changed: INITIAL_SESSION undefined
[BottomNav] Current user: undefined
[BottomNav] Auth state changed: INITIAL_SESSION undefined

[SupabaseAuthCard] Auth state changed: SIGNED_IN <user-id>
[SupabaseAuthCard] User signed in: <user-id>
[SupabaseAuthCard] Initializing profile for new user
[SupabaseAuthCard] Profile initialized successfully: {success: true}
[SupabaseAuthCard] Redirecting to dashboard...

[Header] Auth state changed: SIGNED_IN <user-id>
[Header] User signed in/updated
[BottomNav] Auth state changed: SIGNED_IN <user-id>
[BottomNav] User signed in/updated

GET /dashboard 200

=== MIDDLEWARE REDIRECT ===
(User session established, profile loaded, no role found)
(Middleware redirects /dashboard → /onboarding/role)

GET /onboarding/role 200

=== ROLE SELECTION ===
[setMyRole] Setting role for user: <user-id> role: client
[setMyRole] Role updated successfully for user: <user-id>

(Redirect to /dashboard or /pro-dashboard)

GET /dashboard 200 (or /pro-dashboard 200)
```

---

## File Structure for Flow

| Step | Route | Component | File |
|------|-------|-----------|------|
| 1 | /sign-up | SupabaseAuthCard | `src/app/sign-up/[[...sign-up]]/page.tsx` |
| 2 | /dashboard (redirected) | Middleware check | `src/middleware.ts` |
| 2b | /onboarding/role | RoleSelectionPage | `src/app/onboarding/role/page.tsx` |
| 3 | /onboarding/role | setMyRole action | `src/app/actions/profiles.ts` |
| 4 | /dashboard or /pro-dashboard | Dashboard | `src/app/dashboard/page.tsx` or `src/app/pro-dashboard/page.tsx` |

---

## Common Issue Checklist

### If Sign Up Doesn't Redirect

**Check List:**
- [ ] `SupabaseAuthCard` shows `[SupabaseAuthCard] Redirecting to dashboard...` in console
- [ ] `useRouter` is imported in SupabaseAuthCard
- [ ] `router.push("/dashboard")` is being called
- [ ] 500ms delay before redirect is happening

**Verify:**
```
const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
  → Should see "Auth state changed: SIGNED_IN" event

setTimeout(() => {
  router.push("/dashboard");
  router.refresh();
}, 500);
  → Should redirect after 500ms
```

### If Role Page Doesn't Show

**Check List:**
- [ ] User is authenticated (check session in cookies)
- [ ] Middleware is running (check routes/manifest)
- [ ] Role is null in database for user
- [ ] Middleware isRoleGatedPath includes /dashboard

**Verify:**
```
Middleware checks:
1. Is user authenticated? → Yes (SIGNED_IN event)
2. Is /dashboard in isRoleGatedPath()? → Yes
3. Does user have role? → No (null)
4. Redirect to /onboarding/role? → Should happen
```

### If Role Selection Fails

**Check List:**
- [ ] Server action `setMyRole` is imported
- [ ] Form submission triggers the action
- [ ] Server logs show [setMyRole] logs
- [ ] Database role column accepts updates
- [ ] No RLS policy blocking update

**Verify:**
```
Server action should log:
[setMyRole] Setting role for user: <user-id> role: <role>
[setMyRole] Role updated successfully for user: <user-id>

If error appears:
[setMyRole] Database error: {message, code, details, hint}
```

### If Dashboard Doesn't Load

**Check List:**
- [ ] Redirect completed (check URL bar)
- [ ] HTTP 200 response (check Network tab)
- [ ] Component renders without errors
- [ ] No TypeScript errors in console

**Verify:**
```
Network tab:
GET /dashboard → 200 OK
GET /pro-dashboard → 200 OK

Console:
No "Error" messages
No "Type error" messages
[Header] auth state should be SIGNED_IN
```

---

## Testing Checklist

### Pre-Test
- [ ] Dev server running on :3000
- [ ] Browser DevTools console open
- [ ] Network tab visible
- [ ] Fresh browser session or logged out

### During Sign Up
- [ ] New email entered (must be valid Supabase auth)
- [ ] Password entered (8+ characters recommended)
- [ ] Submit button clicked
- [ ] Watch console for logs
- [ ] Watch URL for redirects

### During Role Selection
- [ ] "What's your role?" page visible
- [ ] Two role buttons clickable
- [ ] Select one role
- [ ] Watch console for [setMyRole] logs
- [ ] Watch URL for redirect

### After Completion
- [ ] Correct dashboard loaded
- [ ] Profile "U" button visible in header
- [ ] Navigation shows correct items for role
- [ ] Page content loads without errors
- [ ] URL shows correct dashboard

---

## Success Criteria

✅ **Complete Sign Compat Flow:**
1. Sign up successful (new user created)
2. Redirected to /dashboard
3. Middleware detects no role
4. Redirected to /onboarding/role
5. Role selection page displays
6. User selects a role
7. Role saved to database
8. Redirected to correct dashboard
9. Dashboard loads successfully
10. All navigation works properly

---

## Quick Debug Commands

```bash
# Check database for user
SELECT id, email, role, created_at FROM profiles WHERE email = 'test@example.com';

# Check auth session in browser
Copy and paste in console: JSON.parse(localStorage.getItem('sb-fjdevppmvjzzybmsoyvi-auth'))

# Check for console errors
Open DevTools → Console tab
Search for keywords:
  - "Error"
  - "error"
  - "failed"
  - "Failed"
  - "500"
  - "null"
```

---

## Test Case 1: Client Sign Up Flow

**Time:** ~30 seconds  
**Steps:**
1. Go to /sign-up
2. Email: `client-test-001@example.com` (or similar)
3. Password: `Test123!@#`
4. Click "Sign up with Email"
5. Wait for redirect to /onboarding/role (automatic)
6. Click "I'm a Client"
7. Verify redirect to /dashboard
8. Verify profile "U" button shows in header
9. Verify "I'm a Pro" NOT in nav

**Expected Result:** ✅ User at /dashboard with client role

---

## Test Case 2: Pro Sign Up Flow

**Time:** ~30 seconds  
**Steps:**
1. Sign out (or new browser session)
2. Go to /sign-up
3. Email: `pro-test-001@example.com`
4. Password: `Test123!@#`
5. Click "Sign up with Email"
6. Wait for redirect to /onboarding/role
7. Click "I'm a Pro"
8. Verify redirect to /pro-dashboard
9. Verify profile "U" button shows
10. Verify "Post a Job" disabled or unavailable

**Expected Result:** ✅ User at /pro-dashboard with pro role

---

## Test Case 3: Error Recovery

**Time:** ~20 seconds  
**Steps:**
1. During sign up, use invalid email (e.g., no @)
2. Try to submit
3. Should see validation error
4. Fix email
5. Resubmit
6. Should succeed

**Expected Result:** ✅ Error shows but sign up doesn't fail

---

## Notes & Observations

### Data to Validate
- User created in Supabase auth
- Profile record created in DB
- Role correctly set to "client" or "pro"
- Email matches signup email
- Session token valid

### Performance Metrics
- Sign up form load: <1s
- Auth processing: 1-2s
- Role selection: immediate
- Dashboard load: 1-2s
- **Total flow time:** 5-7s

### Browser Compatibility
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## Troubleshooting Flow Chart

```
Sign up enters credentials
        ↓
    Submitted?
    ├─ NO → Fix form (email format, password length)
    └─ YES ↓
         Auth event fires?
         ├─ NO → Check [SupabaseAuthCard] logs
         │       Check Supabase configuration
         └─ YES ↓
              Profile created?
              ├─ NO → Check [SupabaseAuthCard] Profile initialized logs
              │       Check database permissions
              └─ YES ↓
                   Redirected to /dashboard?
                   ├─ NO → Check router.push() in SupabaseAuthCard
                   │       Check console for redirect errors
                   └─ YES ↓
                        Middleware redirected to /onboarding/role?
                        ├─ NO → Check middleware.ts isRoleGatedPath
                        │       Verify role is null in DB
                        └─ YES ↓
                             Role selection page loaded?
                             ├─ NO → Check page load errors
                             │       Verify server auth
                             └─ YES ↓
                                  Role selected and saved?
                                  ├─ NO → Check [setMyRole] logs
                                  │       Check database permissions
                                  └─ YES ↓
                                       Redirected to correct dashboard?
                                       ├─ NO → Check setMyRole redirect
                                       │       Check middleware role routing
                                       └─ YES ↓
                                            ✅ FLOW COMPLETE
```

---

## Final Steps After Completion

1. Screenshot/document successful flow
2. Check Supabase dashboard for user record
3. Verify role in profiles table
4. Check sign out works
5. Verify login with same account works
6. Confirm session persists across page reloads

---

**Status: Ready for Testing** ✅
