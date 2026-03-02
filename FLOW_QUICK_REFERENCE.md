# Complete Onboarding Flow - Quick Reference

**Status:** ✅ ALL FIXES DEPLOYED  
**Date:** March 2, 2026  
**Dev Server:** http://localhost:3000

---

## What to Watch For - Console Logs

### 1️⃣ Sign Up Phase
Watch for these logs in console:
```
✅ [SupabaseAuthCard] Auth state changed: SIGNED_IN <user-id>
✅ [SupabaseAuthCard] User signed in: <user-id>
✅ [SupabaseAuthCard] Initializing profile for new user
✅ [SupabaseAuthCard] Profile initialized successfully: {success: true}
✅ [SupabaseAuthCard] Redirecting to dashboard...

❌ If you DON'T see [SupabaseAuthCard] logs:
   → Check if Supabase client initialized (check [useSupabaseClient] logs)
   → Verify NEXT_PUBLIC_SUPABASE_URL in environment

❌ If redirect doesn't happen:
   → Check browser console for router errors
   → Verify user got created in Supabase Auth
```

### 2️⃣ Middleware Role Check
Automatic redirect happens (you won't see logs, but it works):
```
URL Changes: /dashboard → /onboarding/role
Middleware checks:
  1. Is user authenticated? ✅ Yes
  2. Does /dashboard require role? ✅ Yes
  3. Does user have role? ❌ No
  4. Redirect to /onboarding/role? ✅ Yes
```

### 3️⃣ Role Selection Phase
Watch for these logs when selecting a role:
```
✅ [setMyRole] Setting role for user: <user-id> role: client
✅ [setMyRole] Role updated successfully for user: <user-id>

❌ If you see error like:
   [setMyRole] Database error: {message: "...", code: "...", details: "..."}
   → This shows exactly what the database error is
   → Check the error message for specific details
```

### 4️⃣ Dashboard Load
Final redirect and page load:
```
✅ GET /dashboard 200 (for client)
✅ GET /pro-dashboard 200 (for pro)
✅ Profile "U" button visible in header

❌ If dashboard doesn't load:
   → Check Network tab for status code
   → Look for TypeScript errors in console
   → Verify component render
```

---

## The Flow In 5 Steps

### Step 1: Visit Sign-Up Page
**URL:** http://localhost:3000/sign-up  
**Action:** Fill email and password, click "Sign up"  
**Component:** SupabaseAuthCard  
**Expected:** Supabase creates auth user and profile record

### Step 2: Auto-Redirect to Dashboard
**Trigger:** SIGNED_IN event from Supabase  
**Component:** SupabaseAuthCard (router.push)  
**Expected:** Browser URL changes to /dashboard

### Step 3: Middleware Checks Role
**Trigger:** Request to /dashboard  
**Component:** middleware.ts  
**Check:** User authenticated? YES. Has role? NO.  
**Action:** Redirect to /onboarding/role

### Step 4: Select Role
**URL:** http://localhost:3000/onboarding/role  
**Action:** Click "I'm a Client" or "I'm a Pro"  
**Component:** Form with setMyRole server action  
**Expected:** Database updates profiles.role

### Step 5: Final Dashboard
**URL:** /dashboard (client) or /pro-dashboard (pro)  
**Component:** Dashboard page  
**Action:** Page loads with correct role-based content

---

## Expected Console Output Timeline

**Time: 0:00** - User loads sign-up page
```
[useSupabaseClient] Creating new Supabase client instance
[Header] Current user: undefined
[Header] Auth state changed: INITIAL_SESSION undefined
[BottomNav] Current user: undefined
[BottomNav] Auth state changed: INITIAL_SESSION undefined
```

**Time: 0:05** - User submits sign-up form
```
(Supabase processing...)
```

**Time: 0:10** - Auth succeeds
```
[SupabaseAuthCard] Auth state changed: SIGNED_IN <id>
[SupabaseAuthCard] User signed in: <id>
[SupabaseAuthCard] Initializing profile for new user
[SupabaseAuthCard] Profile initialized successfully: {success: true}
[SupabaseAuthCard] Redirecting to dashboard...
```

**Time: 0:15** - Redirect happens, middleware checks
```
[Header] Auth state changed: SIGNED_IN <id>
[Header] User signed in/updated
[BottomNav] Auth state changed: SIGNED_IN <id>
[BottomNav] User signed in/updated
(Middleware processes and redirects)
```

**Time: 0:20** - Role selection page loads
```
GET /onboarding/role 200 in 150ms
```

**Time: 1:00** - User clicks role button
```
[setMyRole] Setting role for user: <id> role: client
[setMyRole] Role updated successfully for user: <id>
```

**Time: 1:05** - Final dashboard loads
```
GET /dashboard 200 in 180ms
or
GET /pro-dashboard 200 in 180ms
```

---

## Success Validation Checklist

As you go through the flow, verify:

### After Sign-Up ✓
- [ ] See "[SupabaseAuthCard] Redirecting to dashboard..." in console
- [ ] URL changed from /sign-up to /dashboard and then to /onboarding/role
- [ ] "Welcome to FundiGuard - What's your role?" page shows
- [ ] Profile "U" button visible in header
- [ ] No errors in console

### After Role Selection ✓
- [ ] See "[setMyRole] Role updated successfully" in console
- [ ] URL changed to /dashboard or /pro-dashboard
- [ ] Dashboard page loads with content
- [ ] Navigation shows appropriate items for role
- [ ] No errors in console

### At Final Dashboard ✓
- [ ] Correct dashboard loaded (client or pro)
- [ ] All page content visible
- [ ] Navigation bar functional
- [ ] Sign out button works
- [ ] No 404 or error messages

---

## If Something Goes Wrong

### Debug Step 1: Check Console
Open DevTools (F12) → Console tab
```
Search for keywords:
  - "error" (case-insensitive)
  - "Error"
  - "500"
  - "failed"
  - "FAILED"
```

### Debug Step 2: Check Network Tab
Open DevTools → Network tab
```
Look for:
  - Failed requests (red)
  - 500 status codes
  - POST requests (for form submits)
  
PRO TIP: Check the response of the failed request
         Click on request → Response tab
         See actual error message
```

### Debug Step 3: Check URL
```
If stuck on /sign-up:
  → Redirect to /dashboard didn't happen
  → Check [SupabaseAuthCard] logs

If stuck on /dashboard:
  → Middleware didn't redirect to /onboarding/role
  → User might not have been created properly

If stuck on /onboarding/role:
  → Role update failed
  → Check [setMyRole] logs for database error

If stuck trying to load dashboard:
  → Page component has error
  → Check console for TypeScript/render errors
```

### Debug Step 4: Check Database
In Supabase dashboard:
```
1. Go to Authentication → Users
   - Find your test user email
   - Verify user ID matches console logs

2. Go to SQL Editor, run:
   SELECT id, email, role, created_at FROM profiles 
   WHERE email = 'your-test-email@example.com';
   
   - Verify profile exists
   - Verify role updated correctly
```

---

## Common Scenarios & How to Fix

### Scenario 1: "Redirect to dashboard but stuck on /dashboard"
**Symptom:** URL shows /dashboard, but page shows spinner or doesn't redirect to /onboarding/role  
**Cause:** Middleware might not be running or role check failing  
**Fix:**
1. Hard refresh browser (Ctrl+F5)
2. Check network tab for /onboarding/role request
3. Verify user has valid session (check cookies)

### Scenario 2: "500 error when selecting role"
**Symptom:** Click role button, see 500 error, console shows [setMyRole] Database error  
**Cause:** Database error (RLS policy, column issue, etc.)  
**Fix:**
1. Check exact error message in console
2. Look at hint/details from database error
3. Verify profiles table has role column of correct type
4. Check RLS policies allow role updates

### Scenario 3: "Redirected to wrong dashboard"
**Symptom:** Selected "Pro" but landed on /dashboard  
**Cause:** Middleware might have the role-path redirect wrong  
**Fix:**
1. Check middleware.ts role routing logic
2. Verify database actually saved the correct role
3. Refresh page (not just browser refresh, but full reload)

### Scenario 4: "Sign out failed"
**Symptom:** Clicked sign out, got error or stayed on page  
**Cause:** supabase client null or sign out action failed  
**Fix:**
1. Check [Header] logs for auth state
2. Try refreshing first
3. Check if button is disabled (grayed out)
4. Look for sign out errors in console

---

## Performance Expectations

| Phase | Expected Time | Sign |
|-------|---|---|
| Sign up form loads | <500ms | ✅ Fast |
| Auth processing | 1-2s | ✅ Normal |
| Profile creation | <500ms | ✅ Fast |
| Redirect to dashboard | 500ms delay (built-in) | ✅ Ok |
| Middleware role check | <100ms | ✅ Fast |
| Role page loads | <500ms | ✅ Fast |
| Role selection submission | 1-2s | ✅ Normal |
| Dashboard loads | 1-3s | ✅ Normal |
| **Total Time** | **5-10s** | ✅ Good |

---

## Key Files Involved

| File | Purpose | Key Function |
|------|---------|---|
| src/app/sign-up/page.tsx | Sign-up page wrapper | Renders SupabaseAuthCard |
| src/components/auth/supabase-auth-card.tsx | Auth form & redirect | Listens for SIGNED_IN, redirects to /dashboard |
| src/lib/hooks/useSupabaseClient.ts | Shared Supabase client | Singleton pattern prevents duplicate clients |
| src/middleware.ts | Route protection & redirects | Checks role, redirects no-role users to /onboarding/role |
| src/app/onboarding/role/page.tsx | Role selection page | Displays client/pro buttons |
| src/app/actions/profiles.ts | Server action | setMyRole updates database and redirects |
| src/app/dashboard/page.tsx | Client dashboard | Shows for client users |
| src/app/pro-dashboard/page.tsx | Pro dashboard | Shows for pro users |

---

## Browser DevTools Tips

### Watch Network Requests
```
Open DevTools → Network tab
Filter: XHR (to see API calls)

You should see:
  1. POST /sign-up (Supabase auth)
  2. POST to initialize profile (server action)
  3. GET /onboarding/role (after middleware redirect)
  4. POST to setMyRole (when selecting role)
  5. GET /dashboard or /pro-dashboard (final page)
```

### Watch Storage
```
Open DevTools → Application → Cookies
Look for cookie named: sb-fjdevppmvjzzybmsoyvi-auth

This cookie contains:
  - Auth session token
  - User ID
  - Session expiration

If this cookie doesn't exist:
  → Auth session not established
  → Sign in will fail or redirect won't work
```

### Watch Console Grouping
```
Enable console grouping in DevTools settings
Grouped logs show flow more clearly

Example:
[SupabaseAuthCard]
  ├─ Auth state changed: SIGNED_IN
  ├─ User signed in: <id>
  ├─ Initializing profile
  └─ Redirecting to dashboard
```

---

## Success Look-Alike Checklist

✅ **Successful Flow:**
- User account created in Supabase
- Profile record created in database
- Redirected through onboarding properly
- Role selected and saved correctly
- Correct dashboard loaded
- Navigation works for selected role
- Sign out button functions
- Page reloads maintain session

✅ **Valid Error State:**
- Clear error message in console
- User can understand what went wrong
- Can retry operation
- No infinite loops or blank pages

---

## Ready for Testing!

All code changes are deployed:
- ✅ Singleton Supabase client (no more duplicates)
- ✅ Null checks on all client usage
- ✅ Verbose console logging for debugging
- ✅ Proper redirect flow in place
- ✅ Error handling at each step

**Next:** Follow the flow in ONBOARDING_FLOW_TEST.md for detailed step-by-step testing.
