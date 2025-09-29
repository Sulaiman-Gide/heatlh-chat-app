import { ThemedText } from "@/components/themed-text";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: 400,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === "android" ? 12 : 0,
  },
  headerLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  contactInfo: {
    marginLeft: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  contactStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  messageBubbleLeft: {
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start" as const,
  },
  messageBubbleRight: {
    borderBottomRightRadius: 4,
    alignSelf: "flex-end" as const,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTimeContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    marginRight: 4,
  },
  messageStatus: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    padding: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingTop: 10,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 8,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  inputButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emojiButton: {
    padding: 6,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginLeft: 8,
  },
});

import { Colors } from "@/constants/theme";
import { useTabBar } from "@/contexts/TabBarContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { chatService } from "@/services/chat";
import { useAuthStore } from "@/store/auth";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";

import type { Message as DBMessage } from "@/types/chat";

export default function ChatDetail() {
  const { session } = useAuthStore();
  const user = session?.user;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  // Get conversationId and contactName from params
  const { id: conversationId, contactName = "Chat" } = useLocalSearchParams<{
    id: string;
    contactName?: string;
  }>();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const { hideTabBar, showTabBar } = useTabBar();
  const isMounted = React.useRef(true);

  // Hide tab bar when this screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log("ChatDetail: Hiding tab bar");
      hideTabBar();

      // Ensure we show the tab bar when the component is unmounted
      return () => {
        if (isMounted.current) {
          console.log("ChatDetail: Showing tab bar (from cleanup)");
          showTabBar();
        }
      };
    }, [hideTabBar, showTabBar])
  );

  // Fetch messages and subscribe to new ones
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const fetchAndSubscribe = async () => {
      if (!conversationId) return;
      setIsLoading(true);
      try {
        const msgs = await chatService.getMessages(conversationId as string);
        setMessages(msgs || []);
      } catch (e) {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
      // Subscribe to new messages
      if (user?.id) {
        unsubscribe = chatService.subscribeToMessages(
          user.id,
          (payload: any) => {
            if (payload.new && payload.new.conversation_id === conversationId) {
              setMessages((prev) => [...prev, payload.new]);
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
          }
        );
      }
    };
    fetchAndSubscribe();
    return () => {
      if (unsubscribe) unsubscribe();
      isMounted.current = false;
      showTabBar();
    };
  }, [conversationId, user?.id, showTabBar]);

  const handleSend = async () => {
    if (message.trim() === "" || !conversationId || !user?.id) return;
    try {
      const sent = await chatService.sendMessage(
        conversationId as string,
        user.id,
        message.trim()
      );
      setMessages((prev) => [...prev, sent]);
      setMessage("");
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (e) {
      // Optionally show error
    }
  };

  const handleBack = () => {
    router.replace("/(app)/chat-screen");
  };

  // Optionally render status if you want
  const renderMessageStatus = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case "sent":
        return <Ionicons name="checkmark" size={16} color={colors.text} />;
      case "delivered":
        return <Ionicons name="checkmark-done" size={16} color={colors.text} />;
      case "read":
        return <Ionicons name="checkmark-done" size={16} color={colors.tint} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.contactInfo}>
            <ThemedText style={[styles.contactName, { color: colors.text }]}>
              {contactName}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {isLoading ? (
            <ThemedText>Loading messages...</ThemedText>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <View>
                  {/* Sender name */}
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: isMe ? colors.text + "80" : colors.text,
                      marginBottom: 0,
                      marginRight: isMe ? 5 : 0,
                      marginLeft: isMe ? 0 : 5,
                      textAlign: isMe ? "right" : "left",
                      fontWeight: "600",
                    }}
                  >
                    {isMe ? "You" : contactName}
                  </ThemedText>

                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      isMe
                        ? [
                            styles.messageBubbleRight,
                            { backgroundColor: colors.tint + "20" },
                          ]
                        : [
                            styles.messageBubbleLeft,
                            {
                              backgroundColor: "#f1f3f6",
                              borderWidth: 1,
                              borderColor: colors.border,
                            },
                          ],
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.messageText,
                        {
                          color: colors.text,
                          textAlign: isMe ? "right" : "left",
                        },
                      ]}
                    >
                      {msg.content}
                    </ThemedText>
                    <View
                      style={[
                        styles.messageTimeContainer,
                        { justifyContent: isMe ? "flex-end" : "flex-start" },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.messageTime,
                          { color: colors.text + "80" },
                        ]}
                      >
                        {msg.created_at
                          ? new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </ThemedText>
                      {isMe && (
                        <View style={styles.messageStatus}>
                          {renderMessageStatus(msg.status)}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.background },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Type a message"
              placeholderTextColor={colors.text + "80"}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.tint }]}
            onPress={handleSend}
            disabled={message.trim() === ""}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
