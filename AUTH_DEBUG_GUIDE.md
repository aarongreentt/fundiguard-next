# Authentication Debug Guide

## 🔍 Authentication Flow Overview

FundiGuard uses **Supabase Auth** with a hybrid approach:
- **Browser Client** (`client.ts`) - Client-side authentication
- **Server Client (SSR)** (`server-ssr.ts`) - Server-side session management
- **Service Role Client** (`server.ts`) - Admin operations only

---

## 📋 Auth Flow Diagram

```
User Visit App
    ↓
Middleware checks auth.session (from cookies)
    ↓
Redirect to /sign-in if no session
    ↓
↙                    ↘
Sign In Page         Sign Up Page
(sign-in/page.tsx)  (sign-up/page.tsx)
    ↓                     ↓
SupabaseAuthCard (Supabase Auth UI)
    ↓
Browser Client authenticates
    ↓
Session stored in cookies
    ↓
Middleware refreshes & validates
    ↓
User redirected to dashboard
    ↓
Server components read session from cookies
↙                    ↘                    ↘
/profile            /pro-dashboard      /insurance
(Profile page)      (Dashboard)          (Insurance mgmt)
```

---

## 🔐 Authentication Files

### **1. Sign In/Sign Up Pages**
**Files:** `src/app/sign-in/[[...sign-in]]/page.tsx`, `src/app/sign-up/[[...sign-up]]/page.tsx`

```tsx
"use client";
import { SupabaseAuthCard } from "@/components/auth/supabase-auth-card";

export default function Page() {
  return <SupabaseAuthCard view="sign_in" />;
}
```

**What happens:**
- ✅ Renders Supabase Auth UI (email/password form)
- ✅ Handles sign up validation
- ✅ Creates session on successful auth
- ✅ Stores session in cookies automatically

---

### **2. Supabase Auth Card Component**
**File:** `src/components/auth/supabase-auth-card.tsx`

```tsx
"use client";
import { Auth } from "@supabase/auth-ui-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SupabaseAuthCard({ view }) {
  const supabase = createSupabaseBrowserClient();

  return (
    <Auth
      supabaseClient={supabase}
      providers={[]}
      appearance={{ theme: ThemeSupa }}
      view={view}
    />
  );
}
```

**What it does:**
- Initializes Supabase browser client
- Renders Auth UI components
- Handles email verification
- Manages password reset flows

---

### **3. Sign Out Button**
**File:** `src/components/auth/sign-out-button.tsx`

```tsx
"use client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();  // ← Clears session
        router.refresh();               // ← Refreshes page
      }}
    >
      Sign out
    </Button>
  );
}
```

**What happens:**
- Calls `signOut()` to clear session
- Removes cookies
- Refreshes page to redirect to login

---

### **4. Browser Client**
**File:** `src/lib/supabase/client.ts`

```typescript
"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,      // ← Public URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // ← Public key
  );
}
```

**Client-side only:**
- Used in `"use client"` components
- Has automatic session persistence
- Auto-refreshes tokens
- Reads/writes to localStorage

---

### **5. Server Client (SSR - Recommended)**
**File:** `src/lib/supabase/server-ssr.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();  // ← Read from request
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);  // ← Set in response
          });
        },
      },
    }
  );
}
```

**Server-side benefits:**
- ✅ Reads cookies from request
- ✅ Handles session refresh
- ✅ Automatically updates cookies in response
- ✅ Works in Server Components & API routes
- ✅ More secure (no client-side token exposure)

---

### **6. Service Role Client (Admin)**
**File:** `src/lib/supabase/server.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createSupabaseServerClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,  // ← NEVER expose this!
  );
}
```

**Admin operations only:**
- ⚠️ Uses service role key (must NOT be public)
- For admin functions only
- Can bypass RLS policies
- **NEVER use in client components**

---

## 👤 Profile Fetching

**File:** `src/app/actions/profile.ts`

```typescript
"use server";

export async function getUserProfile() {
  const supabase = await createSupabaseServerClient();
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;  // Not authenticated
  }

  // Fetch user's profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("id,role,full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name || "",
    role: profile?.role || "",
  };
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in");
  }

  // Update auth user
  if (newEmail && newEmail !== user.email) {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
  }

  // Update profile in database
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      role: formData.get("role"),
      full_name: formData.get("fullName"),
      updated_at: new Date().toISOString(),
    });

  if (profileError) throw profileError;
  revalidatePath("/profile");
}
```

---

## 🐛 Common Issues & Debugging

### **Issue 1: Session Not Persisting**
```
❌ Sign in works, but redirects to /sign-in after refresh
```

**Causes:**
1. Browser client not syncing cookies
2. Middleware not reading cookies correctly
3. Cookies being cleared

**Debug steps:**
```javascript
// In browser console (signed in):
1. Check cookies:
   document.cookie

2. Check Supabase session:
   const supabase = createSupabaseBrowserClient();
   const { data: { session } } = await supabase.auth.getSession();
   console.log(session);

3. Check localStorage:
   localStorage.getItem("supabase.auth.token")
```

**Solution:**
- Ensure `server-ssr.ts` is used in server components
- Check that cookies are not being cleared by middleware
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

---

### **Issue 2: Profile Not Loading After Sign Up**
```
❌ Sign up succeeds, but profile page shows 404
```

**Causes:**
1. Auth user created but no profile record in `profiles` table
2. Profile fetch uses wrong column names
3. RLS policy blocking access

**Debug steps:**
```typescript
// In server action:
const supabase = await createSupabaseServerClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

console.log("Auth User:", user);
console.log("Auth Error:", authError);

if (user) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
    
  console.log("Profile:", profile);
  console.log("Profile Error:", profileError);
}
```

**Solution:**
- Create profile record on sign up:
  ```typescript
  // In sign up handler:
  await supabase.from("profiles").insert({
    id: user.id,
    email: user.email,
    created_at: new Date().toISOString(),
  });
  ```
- Check RLS policies allow user to read own profile
- Verify column name mappings (camelCase vs snake_case)

---

### **Issue 3: "You must be signed in" Error**
```
❌ Server action throws: "You must be signed in"
```

**Debug:**
```typescript
"use server";

export async function myAction() {
  const supabase = await createSupabaseServerClient();
  
  // This is the issue line:
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log("User:", user);
  console.log("Error:", error);
  
  if (!user || error) {
    throw new Error("Not authenticated");
  }
}
```

**Causes:**
1. Browser client not synced with server
2. Session expired between requests
3. Wrong client being used (service role instead of SSR)

**Solution:**
- Use `server-ssr.ts` client in server actions
- Call `router.refresh()` after changes
- Use `revalidatePath()` in server actions
- Ensure middleware is running correctly

---

### **Issue 4: Logout Not Working**
```
❌ Click "Sign out" but still logged in
```

**Debug:**
```typescript
export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      onClick={async () => {
        try {
          const supabase = createSupabaseBrowserClient();
          const { error } = await supabase.auth.signOut();
          
          console.log("Sign out error:", error);
          
          router.refresh();               // Refresh server
          router.push("/sign-in");         // Also redirect
        } catch (err) {
          console.error("Sign out failed:", err);
        }
      }}
    >
      Sign out
    </Button>
  );
}
```

**Solution:**
- Add error logging
- Ensure `router.refresh()` is called (refreshes server state)
- Add explicit redirect with `router.push()`
- Clear browser cookies manually if needed

---

## 🧪 Testing Authentication

### **Test 1: Sign Up Flow**
```bash
1. Go to /sign-up
2. Enter test email: test@example.com
3. Enter password: SecurePassword123!
4. Click "Sign up"
5. Expected: Email confirmation (or auto-confirmed in dev)
6. Redirect to dashboard
```

**Check:**
- User created in Supabase Auth
- Profile record in `profiles` table
- Session stored in cookies
- Middleware redirect working

### **Test 2: Sign In Flow**
```bash
1. Sign out first (if logged in)
2. Go to /sign-in
3. Enter test email & password
4. Click "Sign in"
5. Expected: Redirect to dashboard
6. Refresh page - should stay logged in
```

**Check:**
- Session persists after refresh
- Profile loads correctly
- Navigation works

### **Test 3: Session Recovery**
```bash
1. Sign in
2. Keep page open
3. Wait 1 hour (or token expires)
4. Try any action
5. Expected: Token refresh automatically
6. Action succeeds
```

**Check:**
- Auto-refresh working
- No "You must be signed in" error

### **Test 4: Sign Out**
```bash
1. Sign in
2. Click "Sign out" button
3. Expected: Redirect to /sign-in
4. Refresh - should stay on /sign-in
5. Try accessing /profile - should redirect
```

---

## 🔧 Debugging Tools

### **1. Supabase Dashboard**
- URL: https://app.supabase.com
- Check:
  - Authentication → Users (see all users)
  - Database → profiles table (see profile records)
  - RLS Policies (check if blocking queries)

### **2. Browser DevTools**
```javascript
// Check session
const { data } = await supabase.auth.getSession();
console.log(data.session);

// Check user
const { data, error } = await supabase.auth.getUser();
console.log(data.user, error);

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event, "Session:", session);
});
```

### **3. Network Tab**
- Check:
  - POST `/auth/v1/token` - token refresh
  - POST `/auth/v1/signup` - sign up
  - POST `/auth/v1/token?grant_type=refresh_token` - refresh
  - Cookie headers - should contain `sb-*` cookies

### **4. Server Logs**
```bash
# Run dev server with debugging
npm run dev 2>&1 | grep -i "auth|session|error"
```

---

## 📊 Session Data Structure

### **Auth User (from `auth.getUser()`)**
```typescript
{
  id: "123e4567-e89b-12d3-a456-426614174000",  // UUID
  email: "user@example.com",
  email_confirmed_at: "2024-01-01T00:00:00Z",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  aud: "authenticated",
  role: "authenticated",
  // ... other metadata
}
```

### **Profile (from `profiles` table)**
```typescript
{
  id: "123e4567-e89b-12d3-a456-426614174000",  // Same as auth.id
  email: "user@example.com",
  full_name: "John Doe",
  role: "pro" | "client",  // fundi or client
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}
```

### **Session (from cookies)**
```
Cookie: sb-{projectid}-auth-token = {jwt}
Cookie: sb-{projectid}-auth-token-code-verifier = {verifier}
Cookie: sb-{projectid}-auth-token-code-challenge = {challenge}
```

---

## 🚀 Production Checklist

- [ ] Environment variables set correctly
- [ ] Supabase project in production
- [ ] Email confirmations enabled (if needed)
- [ ] Password reset configured
- [ ] RLS policies reviewed
- [ ] Sign out flow tested
- [ ] Session timeout handled
- [ ] Error messages shown to users
- [ ] Middleware protecting routes
- [ ] Profile creation on sign up
- [ ] Token refresh working
- [ ] CORS properly configured

---

## 📚 Documentation References

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Auth UI React](https://supabase.com/docs/guides/auth/auth-ui)
- [Next.js Cookies](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

