"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-ssr";

export async function getConversations(userId: string) {
  console.log('[getConversations] 📬 Fetching conversations for user:', userId);
  
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("conversations_with_preview")
      .select("*")
      .or(`client_id.eq.${userId},fundi_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error('[getConversations] ❌ Error:', error);
      throw new Error(error.message);
    }

    console.log('[getConversations] ✅ Found', data?.length || 0, 'conversations');
    return data || [];
  } catch (error) {
    console.error('[getConversations] ❌ Unexpected error:', error);
    throw error;
  }
}

export async function getMessages(conversationId: string, limit = 50) {
  console.log('[getMessages] 💬 Fetching messages for conversation:', conversationId);
  
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        is_read,
        created_at,
        sender:sender_id(id, first_name, avatar_url)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error('[getMessages] ❌ Error:', error);
      throw new Error(error.message);
    }

    console.log('[getMessages] ✅ Found', data?.length || 0, 'messages');
    return data || [];
  } catch (error) {
    console.error('[getMessages] ❌ Unexpected error:', error);
    throw error;
  }
}

export async function sendMessage(conversationId: string, content: string) {
  console.log('[sendMessage] 📤 Sending message to conversation:', conversationId);
  
  try {
    const supabase = await createSupabaseServerClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[sendMessage] ❌ Not authenticated');
      throw new Error("You must be signed in to send messages");
    }

    if (!content.trim()) {
      console.error('[sendMessage] ❌ Empty message');
      throw new Error("Message cannot be empty");
    }

    console.log('[sendMessage] 📝 Creating message from user:', user.id);
    
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('[sendMessage] ❌ Database error:', error);
      throw new Error(error.message);
    }

    console.log('[sendMessage] ✅ Message sent:', data.id);
    
    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    revalidatePath(`/chat/${conversationId}`);
    return data;
  } catch (error) {
    console.error('[sendMessage] ❌ Unexpected error:', error);
    throw error;
  }
}

export async function createOrGetConversation(jobId: string, otherUserId: string) {
  console.log('[createOrGetConversation] 🔗 Creating/getting conversation for job:', jobId, 'with user:', otherUserId);
  
  try {
    const supabase = await createSupabaseServerClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[createOrGetConversation] ❌ Not authenticated');
      throw new Error("You must be signed in");
    }

    // Get job to determine client_id
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("client_id")
      .eq("id", jobId)
      .single();

    if (jobError) {
      console.error('[createOrGetConversation] ❌ Job not found:', jobError);
      throw new Error("Job not found");
    }

    console.log('[createOrGetConversation] 📋 Job found, client:', job.client_id);

    // Determine client and fundi
    const isCurrentUserClient = user.id === job.client_id;
    const clientId = job.client_id;
    const fundiId = isCurrentUserClient ? otherUserId : user.id;

    console.log('[createOrGetConversation] 🔄 Client:', clientId, 'Fundi:', fundiId, 'Current user is client:', isCurrentUserClient);

    // Try to get existing conversation
    const { data: existing, error: getError } = await supabase
      .from("conversations")
      .select("id")
      .eq("job_id", jobId)
      .eq("client_id", clientId)
      .eq("fundi_id", fundiId)
      .single();

    if (existing) {
      console.log('[createOrGetConversation] ✅ Existing conversation found:', existing.id);
      return existing;
    }

    if (getError && getError.code !== 'PGRST116') {
      console.error('[createOrGetConversation] ❌ Unexpected error:', getError);
      throw new Error(getError.message);
    }

    // Create new conversation
    console.log('[createOrGetConversation] ✨ Creating new conversation...');
    const { data: newConversation, error: createError } = await supabase
      .from("conversations")
      .insert({
        job_id: jobId,
        client_id: clientId,
        fundi_id: fundiId,
      })
      .select()
      .single();

    if (createError) {
      console.error('[createOrGetConversation] ❌ Create error:', createError);
      throw new Error(createError.message);
    }

    console.log('[createOrGetConversation] ✅ Conversation created:', newConversation.id);
    revalidatePath(`/chat`);
    return newConversation;
  } catch (error) {
    console.error('[createOrGetConversation] ❌ Unexpected error:', error);
    throw error;
  }
}

export async function markMessagesAsRead(conversationId: string) {
  console.log('[markMessagesAsRead] ✓ Marking messages as read in conversation:', conversationId);
  
  try {
    const supabase = await createSupabaseServerClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('[markMessagesAsRead] ❌ Not authenticated');
      return;
    }

    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error('[markMessagesAsRead] ❌ Error:', error);
      return;
    }

    console.log('[markMessagesAsRead] ✅ Messages marked as read');
  } catch (error) {
    console.error('[markMessagesAsRead] ❌ Unexpected error:', error);
  }
}

export async function getUnreadCount(userId: string) {
  console.log('[getUnreadCount] 🔔 Getting unread message count for user:', userId);
  
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("messages")
      .select("id")
      .in(
        "conversation_id",
        (
          await supabase
            .from("conversations")
            .select("id")
            .or(`client_id.eq.${userId},fundi_id.eq.${userId}`)
        ).data?.map((c) => c.id) || []
      )
      .eq("is_read", false)
      .neq("sender_id", userId);

    if (error) {
      console.error('[getUnreadCount] ❌ Error:', error);
      return 0;
    }

    const count = data?.length || 0;
    console.log('[getUnreadCount] ✅ Unread count:', count);
    return count;
  } catch (error) {
    console.error('[getUnreadCount] ❌ Unexpected error:', error);
    return 0;
  }
}

export async function getJobsWithBiddersForClient(clientId: string) {
  console.log('[getJobsWithBiddersForClient] 🏢 Getting jobs with bidders for client:', clientId);
  
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get jobs by this client
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, client_id")
      .eq("client_id", clientId);

    if (jobsError) {
      console.error('[getJobsWithBiddersForClient] ❌ Error fetching jobs:', jobsError);
      throw new Error(jobsError.message);
    }

    if (!jobs || jobs.length === 0) {
      console.log('[getJobsWithBiddersForClient] ✅ No jobs found');
      return [];
    }

    // Get all bids for these jobs
    const jobIds = jobs.map(j => j.id);
    const { data: bids, error: bidsError } = await supabase
      .from("bids")
      .select("id, job_id, pro_id")
      .in("job_id", jobIds);

    if (bidsError) {
      console.error('[getJobsWithBiddersForClient] ❌ Error fetching bids:', bidsError);
      throw new Error(bidsError.message);
    }

    if (!bids || bids.length === 0) {
      console.log('[getJobsWithBiddersForClient] ✅ No bids found');
      return [];
    }

    // Get bidder profiles
    const bidderIds = [...new Set(bids.map(b => b.pro_id))];
    const { data: bidders, error: biddersError } = await supabase
      .from("profiles")
      .select("id, first_name, avatar_url")
      .in("id", bidderIds);

    if (biddersError) {
      console.error('[getJobsWithBiddersForClient] ❌ Error fetching bidders:', biddersError);
      throw new Error(biddersError.message);
    }

    // Combine data - map bids to jobs
    const enrichedJobs = (jobs || [])
      .map(job => {
        const jobBids = bids.filter(b => b.job_id === job.id)
          .map(b => ({
            pro_id: b.pro_id,
            pro: bidders?.find(bidder => bidder.id === b.pro_id) || { 
              id: b.pro_id, 
              first_name: 'Unknown', 
              avatar_url: null 
            }
          }));
        
        return {
          ...job,
          bids: jobBids
        };
      })
      .filter(j => j.bids.length > 0); // Only return jobs with bids

    console.log('[getJobsWithBiddersForClient] ✅ Found', enrichedJobs.length, 'jobs with bids');
    return enrichedJobs;
  } catch (error) {
    console.error('[getJobsWithBiddersForClient] ❌ Unexpected error:', error);
    throw error;
  }
}

export async function getJobsWithBidsForFundi(fundiId: string) {
  console.log('[getJobsWithBidsForFundi] 🏢 Getting jobs with bids for fundi:', fundiId);
  
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get bids by this fundi
    const { data: bids, error: bidsError } = await supabase
      .from("bids")
      .select("id, job_id, pro_id")
      .eq("pro_id", fundiId);

    if (bidsError) {
      console.error('[getJobsWithBidsForFundi] ❌ Error fetching bids:', bidsError);
      throw new Error(bidsError.message);
    }

    if (!bids || bids.length === 0) {
      console.log('[getJobsWithBidsForFundi] ✅ No bids found');
      return [];
    }

    // Get jobs with their client info
    const jobIds = bids.map(b => b.job_id);
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, client_id")
      .in("id", jobIds);

    if (jobsError) {
      console.error('[getJobsWithBidsForFundi] ❌ Error fetching jobs:', jobsError);
      throw new Error(jobsError.message);
    }

    // Get client profiles for each job
    const clientIds = [...new Set(jobs?.map(j => j.client_id) || [])];
    const { data: clients, error: clientsError } = await supabase
      .from("profiles")
      .select("id, first_name, avatar_url")
      .in("id", clientIds);

    if (clientsError) {
      console.error('[getJobsWithBidsForFundi] ❌ Error fetching clients:', clientsError);
      throw new Error(clientsError.message);
    }

    // Combine data
    const enrichedJobs = (jobs || []).map(job => {
      const client = clients?.find(c => c.id === job.client_id);
      return {
        ...job,
        client: client || { id: job.client_id, first_name: 'Unknown', avatar_url: null }
      };
    });

    console.log('[getJobsWithBidsForFundi] ✅ Found', enrichedJobs.length, 'jobs');
    return enrichedJobs;
  } catch (error) {
    console.error('[getJobsWithBidsForFundi] ❌ Unexpected error:', error);
    throw error;
  }
}
