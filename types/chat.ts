import { Database } from "@/lib/database.types";

export type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  sender: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  last_message?: Message;
  other_user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
  unread_count: number;
};

export type UserProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  last_seen?: string;
  is_online?: boolean;
};

export type SendMessageParams = {
  conversationId: string;
  content: string;
  senderId: string;
};

export type MarkAsReadParams = {
  messageIds: string[];
  userId: string;
};
