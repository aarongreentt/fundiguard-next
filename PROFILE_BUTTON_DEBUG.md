# Profile Button Debugging Guide

## Current Status
The profile button in the header should display:
- User's **first_name** (or first initial if no name set)
- User's **avatar_url** (or orange circle with initial as fallback)

If you see just "U" → profile data hasn't been loaded or set yet.

## Testing Checklist

### 1. Check if you're authenticated
Visit: **http://localhost:3000/debug/profile**

This page shows:
- ✅/❌ Whether you're signed in
- ✅/❌ Whether a profile exists in the database  
- First name value (or empty)
- Avatar URL (or empty)
- Any database errors

**What to look for:**
- If it says "❌ No authenticated user" → You're not signed in
- If it says "⚠️ No profile data found" → Your profile wasn't created during signup
- If profile shows but `first_name` is empty → You haven't filled out your profile yet

### 2. Fill in your profile (if not done yet)
1. Go to **http://localhost:3000/profile**
2. Click the edit button
3. Fill in at least:
   - First name
   - Location
4. Upload an avatar image
5. Click Save

### 3. Check the header
After saving your profile:
1. Go back to home page **http://localhost:3000**
2. Look at the top right of the header
3. You should see your **first initial** in an orange circle
4. Your **first name** should appear on desktop (hidden on mobile)
5. If you uploaded an avatar, it should show instead of the circle

## Browser Console Debugging

Open your browser's Developer Tools (F12) and go to the **Console** tab.

### Expected logs when page loads:
```
[Header] 🚀 useEffect started with supabase: true
[Header] 👂 Setting up auth state listener...
[Header] 🔍 Checking current auth user...
[Header] ✅ Current user: { id: "...", email: "..." }
[Header] 👤 User found, fetching profile for: ...
[Header] ⚡ fetchProfile called with userId: ...
[Header] 🔍 Querying profiles table for user: ...
[Header] 📊 Query response - data: { first_name: "...", avatar_url: "..." }
[Header] ✅ Profile data received: { first_name: "...", has_avatar: true/false }
[Header] ✅ Profile state updated
```

### If you see ❌ errors:
- **"Supabase not available"** → Client isn't initialized
- **"Auth error"** → Session issue
- **"No profile data found"** → Profile row doesn't exist or query failed
- **Any other error** → Note the error message and check RLS policies

## Common Issues & Solutions

### Issue: "No authenticated user"
**Cause:** You're not signed in
**Fix:** 
1. Click "Sign In" button
2. Create an account or sign in
3. Complete onboarding (role selection)
4. Refresh the debug page

### Issue: "No profile data found" 
**Cause:** Profile wasn't created during signup
**Fix:**
1. Try signing out and signing in again
2. Go to /profile to manually create/update it
3. Files to check: `initializeUserProfile()` in `src/app/actions/profiles.ts`

### Issue: Profile exists but first_name is empty
**Cause:** You haven't filled out your profile name yet
**Fix:**
1. Go to http://localhost:3000/profile
2. Edit your profile
3. Enter your first name
4. Save

### Issue: Console shows no errors but header still shows "U"
**Cause:** Profile data fetched but state didn't update (component re-render issue)
**Possible fixes:**
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Restart dev server: `npm run dev`

## Verification API Endpoint

You can also check profile data via API:
**GET http://localhost:3000/api/debug/profile-info**

Response format:
```json
{
  "authenticated": true,
  "user": { "id": "...", "email": "..." },
  "profile": {
    "id": "...",
    "first_name": "John",
    "avatar_url": "https://...",
    "email": "..."
  },
  "profileError": null
}
```

## Code Locations

- **Header component:** `src/components/layout/header.tsx`
- **Profile fetching:** Lines 26-70 (fetchProfile function)
- **Auth check:** Lines 73-130 (useEffect)
- **Profile rendering:** Lines 203-223 (Profile button JSX)

## Next Steps if still having issues

1. Check the **debug page** at `/debug/profile` for detailed info
2. Look at **browser console** for error messages (F12 → Console tab)
3. Verify your **profile data** is saved by visiting `/profile`
4. Try **signing out** and back in
5. **Restart the dev server**: `npm run dev`
6. **Clear cache** and reload (Ctrl+Shift+R)

## RLS Policies Updated

The profiles table now has Row Level Security (RLS) policies that allow:
- ✅ Reading your own profile
- ✅ Reading any public profile (for browsing fundis)
- ✅ Updating your own profile
- ✅ Creating your profile during signup

These policies are defined in: `supabase/migrations/20260303000004_enable_profiles_rls.sql`
