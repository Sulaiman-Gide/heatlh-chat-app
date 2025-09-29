import { supabase } from "@/lib/supabase";
import { Conversation, Message } from "@/types/chat";

export const chatService = {
  // Get all conversations for the current user
  async getConversations(userId: string): Promise<Conversation[]> {
    console.log("Fetching conversations for user:", userId);

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        last_message: messages!last_message_id(*),
        other_user:profiles!conversations_participant1_id_fkey(*),
        other_user_2:profiles!conversations_participant2_id_fkey(*)
      `
      )
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }

    console.log("Raw conversations data:", data);

    // Process conversations to get the other user's info and unread count
    return data.map((conv: any) => {
      const isParticipant1 = conv.participant1_id === userId;
      const otherUser = isParticipant1 ? conv.other_user_2 : conv.other_user;

      return {
        ...conv,
        other_user: {
          id: otherUser.id,
          full_name: otherUser.full_name,
          avatar_url: otherUser.avatar_url,
          email: otherUser.email,
        },
        unread_count: 0, // Will be updated with real data
      };
    });
  },

  // Subscribe to new messages for conversations the user is part of
  subscribeToMessages(userId: string, callback: (payload: any) => void) {
    let subscription: any = null;
    let isMounted = true;

    // Set up the subscription
    const setupSubscription = async () => {
      try {
        // First, get all conversation IDs for the user
        const { data, error } = await supabase
          .from("conversations")
          .select("id")
          .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

        if (error) throw error;
        if (!data || data.length === 0) return;

        const conversationIds = data.map((c) => c.id);

        // Subscribe to new messages in these conversations
        subscription = supabase
          .channel("messages")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `conversation_id=in.(${conversationIds.join(",")})`,
            },
            (payload: any) => {
              if (isMounted) {
                callback(payload);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Error in message subscription:", error);
      }
    };

    // Start the subscription
    setupSubscription();

    // Return cleanup function
    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  },

  // Subscribe to conversation updates
  subscribeToConversations(userId: string, callback: (payload: any) => void) {
    let subscription: any = null;
    let isMounted = true;

    // Set up the subscription
    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel("conversations")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "conversations",
              filter: `or(participant1_id.eq.${userId},participant2_id.eq.${userId})`,
            },
            (payload: any) => {
              if (isMounted) {
                callback(payload);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Error in conversation subscription:", error);
      }
    };

    // Start the subscription
    setupSubscription();

    // Return cleanup function
    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  },

  // Get or create a conversation between two users
  async getOrCreateConversation(
    user1Id: string,
    user2Id: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc("get_or_create_conversation", {
        user1_id: user1Id,
        user2_id: user2Id,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  },

  // Get all messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
    return data;
  },

  // Send a message in a conversation
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          content,
        },
      ])
      .select()
      .single();
    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }
    return data;
  },
};
