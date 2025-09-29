import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTabBar } from "@/contexts/TabBarContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { chatService } from "@/services/chat";
import { useAuthStore } from "@/store/auth";
import { Conversation } from "@/types/chat";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// Define styles interface
interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  searchContainer: ViewStyle;
  searchIcon: ViewStyle;
  searchInput: TextStyle;
  clearButton: ViewStyle;
  listContent: ViewStyle;
  chatItem: ViewStyle;
  avatarContainer: ViewStyle;
  avatar: ViewStyle;
  avatarText: TextStyle;
  unreadMessage: TextStyle;
  chatContent: ViewStyle;
  chatHeader: ViewStyle;
  chatName: TextStyle;
  chatTime: TextStyle;
  chatMessage: TextStyle;
  unreadBadge: ViewStyle;
  unreadCount: TextStyle;
  loadingContainer: ViewStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  separator: ViewStyle;
}

const ChatScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { session, isLoading: authLoading } = useAuthStore();
  const user = session?.user;
  const tabBarContext = useTabBar?.();
  const { hideTabBar = () => {}, showTabBar = () => {} } = tabBarContext || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    console.log("[fetchConversations] user:", user);
    if (!user?.id) {
      console.log(
        "[fetchConversations] No user ID available, showing user list"
      );
      setIsLoading(false);
      setShowUserList(true);
      return;
    }

    try {
      console.log(
        "[fetchConversations] Fetching conversations for user:",
        user.id
      );
      setIsLoading(true);
      const data = await chatService.getConversations(user.id);
      console.log("[fetchConversations] Fetched conversations:", data);
      setConversations(data || []);
      if (!data || data.length === 0) {
        console.log(
          "[fetchConversations] No conversations found, showing user list"
        );
        setShowUserList(true);
      } else {
        setShowUserList(false);
      }
    } catch (error) {
      //console.error(
      //  "[fetchConversations] Error fetching conversations:",
      //   error
      // );
      setConversations([]);
      setShowUserList(true);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchConversations();

    // Subscribe to new messages
    const unsubscribeMessages = chatService.subscribeToMessages(user.id, () =>
      fetchConversations()
    );

    // Subscribe to conversation updates
    const unsubscribeConversations = chatService.subscribeToConversations(
      user.id,
      () => fetchConversations()
    );

    return () => {
      unsubscribeMessages();
      unsubscribeConversations();
    };
  }, [user?.id, fetchConversations]);

  // Animation on focus
  useFocusEffect(
    useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();

      hideTabBar();

      return () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(-20);
        showTabBar();
      };
    }, [fadeAnim, slideAnim, hideTabBar, showTabBar])
  );

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.other_user.full_name?.toLowerCase().includes(query) ||
        conv.other_user.email.toLowerCase().includes(query) ||
        (conv.last_message?.content?.toLowerCase() || "").includes(query)
    );
  }, [conversations, searchQuery]);
  const handleNewChat = useCallback(() => {
    router.push({
      pathname: "/(app)/new-chat",
      params: {},
    } as any);
  }, [router]);

  const handleSelectUser = useCallback(
    async (userId: string, contactName?: string) => {
      console.log("[handleSelectUser] Clicked userId:", userId, contactName);
      if (!user?.id) {
        console.log("[handleSelectUser] No user.id, aborting");
        return;
      }
      try {
        let name = contactName;
        if (
          !name &&
          typeof conversations !== "undefined" &&
          conversations.length > 0
        ) {
          const selectedUser = conversations
            .map((c) => c.other_user)
            .find((u) => u.id === userId);
          name = selectedUser?.full_name || selectedUser?.email || "Chat";
        }
        const conversationId = await chatService.getOrCreateConversation(
          user.id,
          userId
        );
        console.log(
          "[handleSelectUser] Got conversationId:",
          conversationId,
          name
        );
        router.push({
          pathname: "/(app)/chat-detail",
          params: { id: conversationId, contactId: userId, contactName: name },
        });
      } catch (error) {
        //console.error("Error creating conversation:", error);
      }
    },
    [user?.id, router, conversations]
  );

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      //console.error("Error formatting date:", error);
      return "";
    }
  };

  const renderConversationItem = useCallback(
    ({ item }: { item: Conversation }) => {
      return (
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() =>
            router.push({
              pathname: "/(app)/chat/[id]",
              params: { id: item.id },
            } as any)
          }
        >
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: Colors[colorScheme].tint },
              ]}
            >
              <ThemedText style={styles.avatarText}>
                {item.other_user.full_name?.charAt(0) || "U"}
              </ThemedText>
            </View>
          </View>
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <ThemedText style={styles.chatName}>
                {item.other_user.full_name || item.other_user.email}
              </ThemedText>
              <ThemedText style={styles.chatTime}>
                {formatTime(item.last_message?.created_at)}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.chatMessage,
                item.unread_count > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {item.last_message?.content || "No messages yet"}
            </ThemedText>
          </View>
          {item.unread_count > 0 && (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: Colors[colorScheme].tint },
              ]}
            >
              <ThemedText style={styles.unreadCount}>
                {item.unread_count > 9 ? "9+" : item.unread_count}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [colorScheme]
  );

  // If user is null and not loading conversations, show user list
  if (!user && isLoading) {
    setIsLoading(false);
    return null; // Let the next render show the user list
  }

  console.log(
    "[render] isLoading:",
    isLoading,
    "showUserList:",
    showUserList,
    "user:",
    user
  );
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  if (showUserList || !user) {
    if (authLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (!user) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText>Please log in to use chat</ThemedText>
        </View>
      );
    }
    // Dynamically import UserListScreen and filter out the logged-in user and the unwanted id
    const UserListScreen = require("@/components/user-list").default;
    // Get the list of all users from props or context if available, otherwise pass a filter function
    // If UserListScreen accepts a users prop, filter here. Otherwise, patch UserListScreen to support filtering.
    // We'll assume UserListScreen accepts a filter prop for now:
    const filterUser = (u: any) =>
      u.id !== user.id && u.id !== "7a4f3a43-d2ac-4838-88db-dca2dc6694e6";
    return (
      <UserListScreen onSelectUser={handleSelectUser} filterUser={filterUser} />
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText
          style={[styles.headerTitle, { color: Colors[colorScheme].tint }]}
        >
          Messages
        </ThemedText>
        <TouchableOpacity onPress={handleNewChat}>
          <Ionicons name="add" size={28} color={Colors[colorScheme].tint} />
        </TouchableOpacity>
      </ThemedView>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { borderColor: Colors[colorScheme].border },
        ]}
      >
        <View style={styles.searchIcon}>
          <Ionicons
            name="search"
            size={20}
            color={Colors[colorScheme].text + "80"}
          />
        </View>
        <TextInput
          style={[styles.searchInput, { color: Colors[colorScheme].text }]}
          placeholder="Search conversations..."
          placeholderTextColor={Colors[colorScheme].text + "80"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={Colors[colorScheme].text + "80"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations List */}
      <Animated.FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            {renderConversationItem({ item })}
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => (
          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No conversations found
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  unreadMessage: {
    fontWeight: "600",
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
  chatTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  chatMessage: {
    fontSize: 16,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  separator: {
    height: 1,
    marginLeft: 88,
  },
});

export default ChatScreen;
