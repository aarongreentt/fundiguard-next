import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;
  console.log('[GET /api/messages/[id]] 💬 Fetching messages for conversation:', conversationId);
  
  try {
    const supabase = await createSupabaseServerClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[GET messages] ❌ Not authenticated');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .or(`client_id.eq.${user.id},fundi_id.eq.${user.id}`)
      .single();

    if (convError || !conversation) {
      console.error('[GET messages] ❌ Access denied to conversation');
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        is_read,
        created_at,
        sender:profiles(id, first_name, avatar_url)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error('[GET messages] ❌ Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[GET messages] ✅ Found', data?.length || 0, 'messages');
    
    // Mark messages as read (asynchronously, don't wait)
    (async () => {
      try {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id)
          .eq("is_read", false);
        console.log('[GET messages] ✓ Marked messages as read');
      } catch (err) {
        console.error('[GET messages] ⚠️ Error marking as read:', err);
      }
    })();

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[GET messages] ❌ Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
