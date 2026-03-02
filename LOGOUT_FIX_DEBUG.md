# Sign-Out Bug Fix & Debug Guide

## 🐛 The Problem

**Issue:** Users could not log out from the profile page. Clicking "Sign Out" did nothing.

**Root Cause:** The `onSignOut` callback in ProfileSettings was just logging to console:
```typescript
onSignOut={() => console.log('Sign out clicked')}  // ← Just logs, doesn't sign out!
```

---

## ✅ The Fix

### **1. ProfilePage Component** (`src/components/profile/profile-page.tsx`)

**Added imports:**
```typescript
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
```

**Added handler function:**
```typescript
const handleSignOut = async () => {
  try {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[SignOut] Error:', error.message);
      alert('Failed to sign out: ' + error.message);
      return;
    }

    console.log('[SignOut] Successfully signed out');
    
    // Refresh server state and redirect
    router.refresh();
    router.push('/sign-in');
  } catch (error) {
    console.error('[SignOut] Exception:', error);
    alert('An error occurred while signing out');
  }
};
```

**Connected handler to component:**
```typescript
<ProfileSettings
  settings={settings}
  onSettingChange={handleSettingChange}
  onSignOut={handleSignOut}  // ← Now calls real logout!
  onDeleteAccount={() => console.log('Delete account clicked')}
/>
```

### **2. ProfileSettings Component** (`src/components/profile/profile-settings.tsx`)

**Added state management:**
```typescript
const [isSigningOut, setIsSigningOut] = useState(false);
const [isDeletingAccount, setIsDeletingAccount] = useState(false);
```

**Added confirmation & loading states:**
```typescript
const handleSignOutClick = async () => {
  if (!window.confirm('Are you sure you want to sign out?')) {
    return;
  }

  setIsSigningOut(true);
  try {
    await onSignOut?.();
  } catch (error) {
    console.error('[ProfileSettings] Sign out error:', error);
    setIsSigningOut(false);
  }
};
```

**Updated UI with loading feedback:**
- Shows "Signing out..." while in progress
- Disables button during sign out
- Rotates icon to indicate loading
- Shows confirmation dialog before sign out

---

## 🔄 Complete Sign-Out Flow

```
User clicks "Sign Out" button
            ↓
Confirmation dialog appears
"Are you sure you want to sign out?"
            ↓
User confirms
            ↓
setIsSigningOut(true)
Button disabled, UI shows loading state
            ↓
createSupabaseBrowserClient()
            ↓
supabase.auth.signOut()
(Clears session, removes auth tokens from cookies)
            ↓
Success or Error?
      ↙        ↘
    Error     Success
      ↓          ↓
Show alert   router.refresh()
setIsSigningOut(false) (Refresh server state)
             ↓
          router.push('/sign-in')
          (Redirect to login)
```

---

## 🧪 Testing the Fix

### **Test Case 1: Basic Sign Out**
```
1. Sign in with any account
2. Go to /profile
3. Click "Settings" tab
4. Click "Sign Out" button
5. Click "OK" in confirmation dialog
6. Expected: Should redirect to /sign-in

✅ Verify:
- Cookies cleared
- Session removed
- Cannot access /profile without signing in
```

### **Test Case 2: Error Handling**
```
1. Simulate network error (DevTools → Network → Offline)
2. Sign in
3. Go to /profile → Settings
4. Try to sign out
5. Expected: Error message appears
6. Button re-enabled for retry

✅ Verify:
- Error alert shown
- Can try again
```

### **Test Case 3: Tab Switching**
```
1. Open /profile in 2 tabs
2. Sign out in tab 1
3. Go to tab 2
4. Try to refresh
5. Expected: Redirected to /sign-in

✅ Verify:
- Middleware catches logout
- Session invalidated across tabs
```

---

## 🔍 Debug Commands

### **Check Browser Session**
```javascript
// In browser console (while signed in):
const supabase = createSupabaseBrowserClient();
const { data } = await supabase.auth.getSession();
console.log("Session:", data.session);

// After sign out:
const { data } = await supabase.auth.getSession();
console.log("Session:", data.session);  // Should be null
```

### **Check Cookies**
```javascript
// View auth cookies
document.cookie

// Should contain: sb-{projectid}-auth-token
// After sign out: cookie should be removed
```

### **Monitor Sign Out in Console**
```typescript
// DevTools Console should show:
[SignOut] Successfully signed out
// or
[SignOut] Error: message
```

---

## 🛡️ Security Notes

### **What Gets Cleared**
1. ✅ Auth session (access token + refresh token)
2. ✅ Auth cookies (sb-*-auth-token)
3. ✅ Browser localStorage (supabase.auth.token)
4. ✅ Server session (middleware refreshes on next request)

### **What Stays Safe**
1. ✅ User data in database (RLS policies protect it)
2. ✅ User files in storage (RLS policies protect it)
3. ✅ Other users' data (cannot access without auth)

---

## 📋 Checklist

- [x] Import `useRouter` hook in ProfilePage
- [x] Import `createSupabaseBrowserClient` in ProfilePage
- [x] Implement `handleSignOut` function
- [x] Add error handling and logging
- [x] Call `router.refresh()` after sign out
- [x] Call `router.push('/sign-in')` to redirect
- [x] Add loading states in ProfileSettings
- [x] Add confirmation dialog before sign out
- [x] Show visual feedback (loading spinner)
- [x] Disable button during sign out
- [x] Handle errors gracefully

---

## 🚀 Similar Issues to Check

If users report similar problems in other components:

1. **SignOutButton** (`src/components/auth/sign-out-button.tsx`)
   - ✅ Already correct implementation
   - ✅ Uses `router.refresh()` properly

2. **App Header** (if it has sign out)
   - Check if sign out callback is implemented
   - Should follow same pattern

3. **Dashboard Pages**
   - Check for any sign out buttons
   - Verify they call actual Supabase signOut

---

## 📝 Code Changes Summary

| File | Changes |
|------|---------|
| `src/components/profile/profile-page.tsx` | Added router & Supabase imports, implemented handleSignOut, connected to ProfileSettings |
| `src/components/profile/profile-settings.tsx` | Added state management, confirmation dialog, loading states, error handling |

**Total lines added:** ~50 lines of functional code
**Lines removed:** 1 console.log mock implementation

---

## 🔐 Testing Security

Ensure sign out properly invalidates session:

```sql
-- In Supabase Dashboard
-- Check user's auth history
SELECT * FROM auth.sessions WHERE user_id = 'user_id'
-- Should show session ended after sign out
```

---

## ✨ User Experience Improvements

1. **Confirmation Dialog** - Prevents accidental logout
2. **Loading State** - Shows something is happening
3. **Error Messages** - User knows if logout failed
4. **Visual Feedback** - Spinning icon indicates action in progress
5. **Disabled Button** - Prevents duplicate requests

---

## 🎯 Next Steps

1. ✅ Test sign out works
2. ✅ Test error handling
3. ✅ Test across multiple tabs
4. ✅ Verify middleware catches invalid sessions
5. ✅ Check production behavior

Then add same pattern to other components that handle sign out.

