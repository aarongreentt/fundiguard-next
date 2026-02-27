import { redirect } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/app/actions/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { ServiceAreaSetup } from "@/components/maps/service-area-setup";

export default async function ProfilePage() {
  const user = await getUserProfile();
  
  if (!user) {
    redirect("/sign-in");
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // Get pro service area if user is a pro
  let proServiceArea = null;
  if (user.role === "pro" && authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("service_latitude,service_longitude,service_radius_km")
      .eq("id", authUser.id)
      .maybeSingle();
    
    if (profile?.service_latitude && profile?.service_longitude) {
      proServiceArea = {
        latitude: profile.service_latitude,
        longitude: profile.service_longitude,
        address: "Service area center",
      };
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateUserProfile} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email || ""}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed here. Please use your auth settings.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  defaultValue={user.fullName}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium capitalize">{user.role || "No role selected"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Your role was set during onboarding and cannot be changed here.</p>
                </div>
              </div>

              <Button type="submit" className="mt-4">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {user.role === "pro" && (
          <ServiceAreaSetup
            initialLocation={proServiceArea || undefined}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="text-sm font-mono">{user.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account Type</p>
              <p className="text-sm capitalize">{user.role || "Not set"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
