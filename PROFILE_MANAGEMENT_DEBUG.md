# Profile Management Debugging Guide

## Issue Identified & Fixed

### Root Cause
The Supabase browser client was being recreated on every component render, which caused the `useEffect` dependency array to constantly update, leading to:
- Infinite listener resets
- Multiple profile initialization attempts  
- Potential race conditions

### Fix Applied
✅ **useMemo Hook** - Memoize the supabase client to prevent recreations
✅ **Comprehensive Logging** - Added detailed console logs throughout the signup and profile loading flow
✅ **Better Error Handling** - Added specific error messages to help diagnose issues

---

## Testing Profile Management Flow

### Step 1: Open Browser Console
1. Run `npm run dev`
2. Open Dev Tools: **F12** or **Right-click → Inspect**
3. Go to **Console** tab
4. Keep this visible while testing

### Step 2: Test Signup Flow

**Action:** Go to http://localhost:3000/sign-up

**Expected Console Logs:**
```
[SupabaseAuthCard] Auth state changed: INITIAL_SESSION null
[SupabaseAuthCard] Auth state changed: INITIAL_SESSION {id: "...", email: "test@example.com"}
```

**Then enter email/password and submit:**

```
[SupabaseAuthCard] Auth state changed: SIGNED_IN {id: "...", email: "test@example.com"}
[SupabaseAuthCard] Initializing profile for user: {user_id}
[initializeUserProfile] Initializing profile for user: {user_id}
[initializeUserProfile] Existing profile: null
[initializeUserProfile] Creating new profile record...
[initializeUserProfile] Profile created successfully: {...}
[SupabaseAuthCard] Profile initialized successfully: {success: true}
```

### Step 3: Check Profile Page After Signup

**Action:** After signup, navigate to http://localhost:3000/profile

**Expected Console Logs:**
```
[ProfilePage] Loading profile...
[ProfilePage] User found: {user_id}
[ProfilePage] Profile data loaded: {
  id: "...",
  first_name: "",
  last_name: "",
  email: "test@example.com",
  role: null,
  ...
}
```

**Expected Visual Result:**
- Profile page displays with user's email
- Shows empty profile fields (first_name, last_name not filled yet)
- No error message
- Can edit profile

---

## Debugging Common Issues

### Issue 1: "Profile not found" Error

**Symptoms:**
- Error message appears on profile page
- Console shows: `[ProfilePage] No profile data found for user: {id}`

**Causes & Solutions:**
1. **Profile wasn't created on signup**
   - Check if signup logs show `[initializeUserProfile] Creating new profile record...`
   - If not, check browser console for `[SupabaseAuthCard] Failed to initialize profile:` error

2. **RLS Policies blocking read access**
   - Check Supabase: Tables → profiles → RLS → Are policies enabled?
   - Current: RLS is **disabled** on profiles table (everyone can read/write)
   - If policies exist, verify they allow user to read their own profile

3. **Database not synced**
   - Check Supabase → SQL Editor → Run query:
   ```sql
   SELECT * FROM profiles WHERE id = '{user_id}';
   ```
   - If query returns no rows, profile wasn't created

### Issue 2: Profile Creation Fails on Signup

**Symptoms:**
- Console shows: `[SupabaseAuthCard] Failed to initialize profile:` with error
- Profile page says "Profile not found"

**Debug Steps:**
1. Check the full error in console:
   ```
   [SupabaseAuthCard] Failed to initialize profile: {error_message}
   ```

2. Common errors:
   - `"You must be signed in to continue"` - Auth session not available in server action
   - `"PKEY violation"` - Profile record already exists (shouldn't happen with new users)
   - `"permission denied"` - RLS policy blocking write access

3. Check Supabase server logs:
   - Go to Supabase Dashboard → Logs
   - Filter for recent errors related to `profiles` table

### Issue 3: Profile Page Stuck on Loading

**Symptoms:**
- Loading spinner never goes away
- Console shows: `[ProfilePage] Loading profile...` but nothing after

**Causes:**
- Supabase browser client initialization error
- Network request hanging
- Auth session not being retrieved

**Debug Steps:**
1. Check browser network tab (F12 → Network)
   - Look for API calls to `/auth/v1/user`
   - Should complete within a few seconds

2. Check for auth errors:
   - Console should show if `auth.getUser()` fails
   - Check Supabase → Auth → Users to verify user exists

3. If network is OK, add temporary logging:
   - Open DevTools Console
   - Run:
   ```javascript
   // Check if Supabase client exists
   console.log('Supabase instance:', window.__supabase);
   ```

---

## Complete Signup-to-Profile Flow

### 1. User Signs Up (sign-up page)
```
User enters email/password
↓
Supabase Auth creates new auth user
↓
Browser triggers onAuthStateChange listener (SIGNED_IN event)
↓
SupabaseAuthCard calls initializeUserProfile()
↓
Server action creates profile record with userId = auth.user.id
↓
Profile created with all fields null except id
↓
User can access /profile
```

### 2. User Accesses Profile Page
```
Profile page mounts
↓
useEffect runs loadProfile()
↓
supabase.auth.getUser() retrieves session from cookies
↓
Query profiles table for user's record
↓
Profile data loads and displays
↓
User can edit/view their information
```

---

## Database Schema

The `profiles` table structure:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,              -- User ID from auth
  first_name VARCHAR(50),           -- Can be null
  last_name VARCHAR(50),            -- Can be null
  email VARCHAR(255),               -- Can be null
  phone VARCHAR(20),                -- User's phone number
  role VARCHAR(20),                 -- 'client' or 'fundi' (null until onboarding)
  avatar_url TEXT,                  -- Profile picture URL
  bio TEXT,                         -- User bio
  ... [other fields]
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Key Point:** When a new user signs up, only the `id` field is set. The `role` is null until they complete onboarding. All other fields are null and can be edited later.

---

## Testing Checklist

- [ ] Signup creates a new auth user (check Supabase Auth)
- [ ] Signup logs show profile initialization attempt
- [ ] Profile record created in database (query profiles table)
- [ ] Profile page loads without "Profile not found" error
- [ ] Profile page displays empty fields (waiting to be filled)
- [ ] User can navigate to dashboard after signup
- [ ] User redirected to /onboarding/role if they try /dashboard before completing onboarding
- [ ] Profile data updates when user edits in profile page
- [ ] Email displays correctly (loaded from auth, not database)

---

## Key Files Modified

1. **src/components/auth/supabase-auth-card.tsx**
   - Added useMemo to prevent client recreation
   - Added console logging for auth state changes
   - Improved error handling

2. **src/app/actions/profiles.ts**
   - Added initializeUserProfile() server action
   - Added comprehensive console logging
   - Checks if profile exists before creating

3. **src/components/profile/profile-page.tsx**
   - Added detailed console logging for profile loading
   - Better error messages
   - Improved auth check

---

## Next Steps If Issues Persist

1. **Check browser console first** - All the console logs will tell you where the flow breaks down

2. **Check Supabase directly:**
   - SQL Editor: Query the profiles table
   - Auth: Verify user was created
   - Logs: Check for database errors

3. **Share console output** - The logs will show:
   - What auth events occurred
   - If profile was created
   - What data was loaded
   - Specific error messages

4. **Network issues** - If /profile page shows loading forever:
   - Check Network tab in DevTools
   - Verify API calls to Supabase complete
   - Check for CORS errors

---

## Quick Reference: Console Log Locations

| Component | Success Log | Error Log |
|-----------|------------|-----------|
| Auth Card Signup | `[SupabaseAuthCard] Profile initialized successfully` | `[SupabaseAuthCard] Failed to initialize profile` |
| Profile Init | `[initializeUserProfile] Profile created successfully` | `[initializeUserProfile] Error creating profile` |
| Profile Load | `[ProfilePage] Profile data loaded` | `[ProfilePage] No profile data found` |

Look for these in your console to understand what's happening!
