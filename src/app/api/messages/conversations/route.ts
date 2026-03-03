import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { NextResponse } from "next/server";

export async function GET() {
  console.log('[GET /api/messages/conversations] 📬 Fetching user conversations...');
  
  try {
    const supabase = await createSupabaseServerClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[GET conversations] ❌ Not authenticated');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("conversations_with_preview")
      .select("*")
      .or(`client_id.eq.${user.id},fundi_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error('[GET conversations] ❌ Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[GET conversations] ✅ Found', data?.length || 0, 'conversations');
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[GET conversations] ❌ Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
