import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/pro-dashboard") ||
    pathname.startsWith("/post-job")
  );
}

function isRoleGatedPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/pro-dashboard") ||
    pathname.startsWith("/post-job")
  );
}

export default async function middleware(request: NextRequest) {
  const response = await updateSupabaseSession(request);

  if (!isProtectedPath(request.nextUrl.pathname)) {
    return response;
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isRoleGatedPath(request.nextUrl.pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const role = profile?.role;

    if (role !== "client" && role !== "pro") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/onboarding/role";
      return NextResponse.redirect(redirectUrl);
    }

    if (request.nextUrl.pathname.startsWith("/dashboard") && role !== "client") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/pro-dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    if (request.nextUrl.pathname.startsWith("/pro-dashboard") && role !== "pro") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    if (request.nextUrl.pathname.startsWith("/post-job") && role !== "client") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:css|js|jpg|jpeg|png|gif|svg|ico|webp|map|txt|xml)$).*)",
    "/(api|trpc)(.*)",
  ],
};
