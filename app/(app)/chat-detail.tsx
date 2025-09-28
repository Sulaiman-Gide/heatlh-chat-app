import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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

interface Message {
  id: string;
  text: string;
  sender: "user" | "contact";
  time: string;
  status: "sent" | "delivered" | "read";
}

const MESSAGES: Message[] = [
  {
    id: "1",
    text: "Hey there! How are you doing?",
    sender: "contact",
    time: "10:30 AM",
    status: "read",
  },
  {
    id: "2",
    text: "I'm doing great, thanks for asking! How about you?",
    sender: "user",
    time: "10:32 AM",
    status: "read",
  },
  {
    id: "3",
    text: "I'm good too! Just wanted to check if we're still on for lunch tomorrow?",
    sender: "contact",
    time: "10:33 AM",
    status: "read",
  },
  {
    id: "4",
    text: "Absolutely! 12:30 PM at the usual place?",
    sender: "user",
    time: "10:35 AM",
    status: "delivered",
  },
  {
    id: "5",
    text: "Perfect! Looking forward to it. See you then!",
    sender: "contact",
    time: "10:36 AM",
    status: "read",
  },
];

export default function ChatDetail() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { contactName = 'John Doe' } = useLocalSearchParams<{ contactName: string }>();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Hide tab bar when this screen is focused
  React.useLayoutEffect(() => {
    router.setParams({ hideTabBar: 'true' });
    return () => {
      router.setParams({ hideTabBar: 'false' });
    };
  }, [router]);

  const handleSend = () => {

    if (message.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleBack = () => {
    router.back();
  };

  const renderMessageStatus = (status: Message["status"]) => {
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
            <ThemedText
              style={[styles.contactStatus, { color: colors.text + "80" }]}
            >
              online
            </ThemedText>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
          </TouchableOpacity>
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
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === "user"
                  ? [
                      styles.messageBubbleRight,
                      { backgroundColor: colors.tint + "20" },
                    ]
                  : [
                      styles.messageBubbleLeft,
                      { backgroundColor: colors.card },
                    ],
              ]}
            >
              <ThemedText
                style={[
                  styles.messageText,
                  {
                    color: msg.sender === "user" ? colors.text : colors.text,
                    textAlign: msg.sender === "user" ? "right" : "left",
                  },
                ]}
              >
                {msg.text}
              </ThemedText>
              <View
                style={[
                  styles.messageTimeContainer,
                  {
                    justifyContent:
                      msg.sender === "user" ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <ThemedText
                  style={[styles.messageTime, { color: colors.text + "80" }]}
                >
                  {msg.time}
                </ThemedText>
                {msg.sender === "user" && (
                  <View style={styles.messageStatus}>
                    {renderMessageStatus(msg.status)}
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity style={[styles.inputButton, { marginRight: 8 }]}>
            <Ionicons name="add" size={28} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.inputButton, { marginRight: 8 }]}>
            <Ionicons name="camera" size={24} color={colors.tint} />
          </TouchableOpacity>
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
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons
                name="happy-outline"
                size={24}
                color={colors.text + "80"}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.tint }]}
            onPress={handleSend}
            disabled={message.trim() === ""}
          >
            <Ionicons
              name={message.trim() === "" ? "mic" : "send"}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === "android" ? 12 : 0,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
  },
  contactStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
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
    alignSelf: "flex-start",
  },
  messageBubbleRight: {
    borderBottomRightRadius: 4,
    alignSelf: "flex-end",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  emojiButton: {
    padding: 6,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
