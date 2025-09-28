import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
}

const CHATS: Chat[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    lastMessage: "Don't forget your appointment tomorrow at 2 PM",
    time: "10:30 AM",
    unread: 2,
    isOnline: true,
  },
  {
    id: "2",
    name: "Health Support",
    lastMessage: "Your prescription has been renewed",
    time: "Yesterday",
    unread: 0,
    isOnline: false,
  },
  {
    id: "3",
    name: "John Smith",
    lastMessage: "How are you feeling today?",
    time: "Yesterday",
    unread: 0,
    isOnline: true,
  },
  {
    id: "4",
    name: "Lab Results",
    lastMessage: "Your test results are now available",
    time: "9/26/2023",
    unread: 0,
    isOnline: false,
  },
  {
    id: "5",
    name: "Emergency Contact",
    lastMessage: "Emergency services are available 24/7",
    time: "9/25/2023",
    unread: 0,
    isOnline: true,
  },
];

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-20)).current;

  useFocusEffect(
    React.useCallback(() => {
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

      return () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(-20);
      };
    }, [])
  );

  const filteredChats = React.useMemo(() => {
    return CHATS.filter(
      (chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const initials = getInitials(item.name);
    const backgroundColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

    return (
      <TouchableOpacity
        style={[styles.chatItem, { borderBottomColor: colors.border }]}
        onPress={() =>
          router.push(
            `/(app)/chat-detail?contactName=${encodeURIComponent(item.name)}`
          )
        }
      >
        <View style={[styles.avatarContainer, { backgroundColor }]}>
          <ThemedText style={styles.avatar}>{initials}</ThemedText>
          {item.isOnline && (
            <View
              style={[styles.onlineBadge, { backgroundColor: colors.tint }]}
            />
          )}
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <ThemedText style={[styles.chatName, { color: colors.text }]}>
              {item.name}
            </ThemedText>
            <ThemedText
              style={[styles.chatTime, { color: colors.text + "80" }]}
            >
              {item.time}
            </ThemedText>
          </View>
          <View style={styles.chatFooter}>
            <ThemedText
              style={[
                styles.chatMessage,
                {
                  color: item.unread > 0 ? colors.text : colors.text + "80",
                  fontWeight: item.unread > 0 ? "600" : "400",
                },
              ]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </ThemedText>
            {item.unread > 0 && (
              <View
                style={[styles.unreadBadge, { backgroundColor: colors.tint }]}
              >
                <ThemedText style={styles.unreadText}>{item.unread}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ThemedView style={styles.container}>
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
              backgroundColor: colors.card,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
              Messages
            </ThemedText>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={colors.text + "80"}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search conversations..."
                placeholderTextColor={colors.text + "80"}
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
                    color={colors.text + "80"}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        <Animated.FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
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
              {renderChatItem({ item })}
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
        />
      </ThemedView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(120,120,128,0.12)",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    padding: 8,
  },
  listContent: {
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  onlineBadge: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    bottom: 0,
    right: 0,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    alignItems: "center",
  },
  chatName: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 13,
    opacity: 0.7,
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatMessage: {
    flex: 1,
    fontSize: 15,
    marginRight: 8,
    opacity: 0.7,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 6,
  },
  separator: {
    height: 1,
    marginLeft: 88,
  },
});
