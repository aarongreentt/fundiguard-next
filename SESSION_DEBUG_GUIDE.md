# Session & Middleware Debug Guide

## 🔄 Session Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    User Journey                              │
└─────────────────────────────────────────────────────────────┘
         ↓
    ┌────────────────┐
    │ Navigate to /  │
    │    (app root)  │
    └────────┬───────┘
             ↓
    ┌─────────────────────────┐
    │ MIDDLEWARE RUNS FIRST   │
    │ (src/middleware.ts)     │
    └────────┬────────────────┘
             ↓
    ┌─────────────────────────────────────┐
    │ 1. updateSupabaseSession()          │
    │    - Read cookies from request      │
    │    - Create Supabase client         │
    │    - Call getUser() to refresh      │
    │    - Save new cookies in response   │
    └────────┬───────────────────────────┘
             ↓
    ┌──────────────────────────┐
    │ 2. Check Protected Paths │
    │    - /dashboard          │
    │    - /pro-dashboard      │
    │    - /post-job           │
    └────────┬─────────────────┘
             ↓
    ┌────────────────────────────┐
    │ 3. Verify Auth User        │
    │    if (!data.user)         │
    │      redirect /sign-in     │
    └────────┬───────────────────┘
             ↓
    ┌────────────────────────────┐
    │ 4. Fetch User Profile      │
    │    from profiles table     │
    │    Check role              │
    └────────┬───────────────────┘
             ↓
    ┌────────────────────────────────┐
    │ 5. Role-Based Redirection      │
    │    - No role → /onboarding     │
    │    - Client route + pro role   │
    │      → redirect /pro-dashboard │
    │    - Pro route + client role   │
    │      → redirect /dashboard     │
    └────────┬───────────────────────┘
             ↓
    ┌─────────────────────────┐
    │ 6. Render Page          │
    │    with session intact  │
    └─────────────────────────┘
```

---

## 🧪 Debug Session Issues

### **Test 1: Check if Middleware is Running**

Create a temporary debug endpoint:

```typescript
// src/app/api/debug/session/route.ts
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();

    // Check what cookies exist
    const allCookies = cookieStore.getAll();
    const supabaseCookies = allCookies.filter((c) =>
      c.name.includes("supabase")
    );

    // Try to create client and get user
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.getUser();

    return Response.json({
      message: "Session Debug Info",
      allCookiesCount: allCookies.length,
      supabaseCookies: supabaseCookies.map((c) => ({
        name: c.name,
        hasValue: !!c.value,
        value: c.value?.substring(0, 50) + "...",
      })),
      user: {
        authenticated: !!data.user,
        userId: data.user?.id,
        email: data.user?.email,
        emailConfirmed: !!data.user?.email_confirmed_at,
      },
      error: error?.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
```

**Usage:**
```bash
# While logged in:
curl http://localhost:3000/api/debug/session

# Expected output:
{
  "message": "Session Debug Info",
  "supabaseCookies": [...],
  "user": {
    "authenticated": true,
    "userId": "...",
    "email": "user@example.com"
  }
}
```

---

### **Test 2: Monitor Middleware Execution**

Add logging to middleware:

```typescript
// src/lib/supabase/middleware.ts (add this)
export async function updateSupabaseSession(request: NextRequest) {
  console.log("[MIDDLEWARE] Request path:", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({ request });

  const cookiesBefore = request.cookies.getAll();
  console.log("[MIDDLEWARE] Cookies before:", cookiesBefore.length);

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          console.log("[MIDDLEWARE] Setting cookies:", cookiesToSet.length);
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  console.log("[MIDDLEWARE] Refreshing session...");
  const { data, error } = await supabase.auth.getUser();
  console.log("[MIDDLEWARE] User:", data.user?.id, "Error:", error?.message);

  return supabaseResponse;
}
```

**Watch server logs:**
```bash
npm run dev 2>&1 | grep "\[MIDDLEWARE\]"
```

---

### **Test 3: Check Protected Route Access**

```typescript
// src/app/api/debug/protected/route.ts
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error: userError } = await supabase.auth.getUser();

    if (!data.user) {
      return Response.json(
        { error: "Not authenticated", details: userError?.message },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    return Response.json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile: profile,
      errors: {
        user: userError,
        profile: profileError,
      },
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
```

---

## 🔍 Common Session Issues

### **Issue 1: Middleware Not Refreshing Session**

**Symptom:**
```
Session expires, next request fails with 401
```

**Root Cause:**
Middleware's `getUser()` should trigger token refresh if needed.

**Check:**
```typescript
// In middleware.ts, verify this line exists:
await supabase.auth.getUser();  // ← This refreshes if needed
```

**Solution:**
Make sure middleware is calling this:
```typescript
// This will:
// 1. Read old, potentially expired token from cookies
// 2. See it's expired
// 3. Use refresh_token to get new token
// 4. Update cookies with new token
await supabase.auth.getUser();
```

---

### **Issue 2: Cookies Not Being Set**

**Symptom:**
```
Login successful, but session lost on next page
```

**Check browser DevTools:**
1. Open Network tab
2. Look for response headers → `set-cookie`
3. Should see `sb-*-auth-token` cookie
4. Cookie should have:
   - ✅ `Secure` flag (HTTPS)
   - ✅ `HttpOnly` flag (can't be accessed by JS)
   - ✅ `SameSite=Lax` (CSRF protection)
   - ✅ Long expiration (usually 1 year)

**Solution:**
- Check middleware's `setAll()` is being called
- Ensure no middleware is clearing cookies
- Verify environment variables are set correctly

---

### **Issue 3: Role-Based Redirect Loop**

**Symptom:**
```
Keep redirecting between /dashboard and /pro-dashboard
```

**Debug:**
```typescript
// Check this in middleware step 5:
if (
  request.nextUrl.pathname.startsWith("/dashboard") &&
  role !== "client"
) {
  // If user is "pro", they get redirected to /pro-dashboard
  // If they try /dashboard again, same redirect happens
}
```

**Common Cause:**
User's role doesn't match route:
- User role = "pro" but visiting /dashboard (client-only)
- User role = "client" but visiting /pro-dashboard (pro-only)

**Solution:**
Check profile in Supabase:
```sql
SELECT id, email, role FROM profiles WHERE id = 'user_id';
```

Verify role is exactly: `'client'` or `'pro'` (not NULL, not other values)

---

### **Issue 4: Onboarding Loop**

**Symptom:**
```
After sign up, keep redirecting to /onboarding/role
```

**Debug chain:**
```typescript
// In middleware:
if (role !== "client" && role !== "pro") {
  // redirect to /onboarding/role
}
```

**Causes:**
1. Profile not created on sign up
2. Role field is NULL
3. Sign up handler doesn't create profile

**Solution:**
Create profile on sign up:
```typescript
// In sign up handler:
const { data: { user } } = await supabase.auth.signUp({
  email,
  password,
});

if (user) {
  // Create profile record
  await supabase.from("profiles").insert({
    id: user.id,
    email: user.email,
    role: "client", // or "pro"
    created_at: new Date().toISOString(),
  });
}
```

---

## 📊 Session State Inspection

### **Browser DevTools Console**

```javascript
// Check Supabase session
const supabase = window.__supabaseClient || 
  createSupabaseBrowserClient();

const { data } = await supabase.auth.getSession();
console.log("Session:", data.session);

// Check user
const { data: userData } = await supabase.auth.getUser();
console.log("User:", userData.user);

// Listen to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event);
  console.log("Session:", session);
});

// Check all auth state
const state = supabase.auth.getState();
console.log("Auth state:", state);
```

---

## 🛡️ Security Checks

### **Check 1: Service Role Key Exposure**

```bash
# Search for service role key in client code
grep -r "SUPABASE_SERVICE_ROLE_KEY" src/app --include="*.tsx" --include="*.ts"
```

**Expected:**
- ❌ No matches in `src/app/` (public code)
- ✅ Only in `src/lib/supabase/server.ts` (private)

**Alert:**
If found in public code:
1. Revoke old service role key in Supabase
2. Generate new one
3. Update `.env.local`

---

### **Check 2: RLS Policies Active**

```sql
-- In Supabase SQL Editor
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should show:
-- profiles    | true (RLS enabled)
-- jobs        | true
-- bids        | true
-- profiles    | true
```

**Verify RLS policies:**
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## 🚀 Production Setup

### **1. Environment Variables (.env.local)**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...your-anon-key
```

**Never commit:**
```
SUPABASE_SERVICE_ROLE_KEY=...  # ← Admin key only
```

### **2. Cookie Security**

In production, ensure:
- ✅ HTTPS enforced (cookies need `Secure` flag)
- ✅ Cookies from `*.supabase.co` domain
- ✅ `HttpOnly` flag set (JS can't steal it)
- ✅ `SameSite=Lax` for CSRF protection

### **3. CORS Configuration**

In Supabase Dashboard → Project Settings → API:
- Add your production domain to "Additional allowed URL paths"
- Example: `https://fundiguard.com`

---

## 📋 Debugging Checklist

- [ ] Environment variables `.env.local` set
- [ ] Middleware running (check logs)
- [ ] Cookies appearing in DevTools
- [ ] `getUser()` returning user in middleware
- [ ] Profile created on sign up
- [ ] Role assigned correctly
- [ ] No redirect loops
- [ ] Sign out clearing cookies
- [ ] Sign in persists after refresh
- [ ] Protected routes blocked without auth
- [ ] Role-based routes working
- [ ] Token refresh on expiry

