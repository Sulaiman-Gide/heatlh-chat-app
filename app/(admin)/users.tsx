import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type User = {
  id: string;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string | null;
};

export default function UsersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useAuthStore();
  const currentUser = session?.user;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const { data: users, error } = await supabase.rpc(
        "get_users_with_profiles"
      );

      if (error) throw error;

      setAllUsers(users || []);
      setDisplayedUsers(users || []);
    } catch (error) {
      console.log("Error fetching users:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setDisplayedUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter((user) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.email?.toLowerCase().includes(searchLower) ||
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower)
      );
    });

    setDisplayedUsers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  const toggleUserStatus = async (
    userId: string,
    currentStatus: boolean | undefined
  ) => {
    // If currentStatus is undefined, default to false (inactive)
    const newStatus = currentStatus === undefined ? true : !currentStatus;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      const updatedUsers = allUsers.map((user) =>
        user.id === userId ? { ...user, is_active: newStatus } : user
      );

      setAllUsers(updatedUsers);
      setDisplayedUsers(updatedUsers);
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown";
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={[styles.userCard, { backgroundColor: "#696c70" }]}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <ThemedText type="subtitle" style={styles.userEmail}>
            {item.email}
            {item.id === currentUser?.id && " (You)"}
          </ThemedText>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.is_active ? "#4CAF50" : "#F44336",
                opacity: item.is_active ? 1 : 0.5,
              },
            ]}
          >
            <ThemedText style={styles.statusText}>
              {item.is_active ? "Active" : "Inactive"}
            </ThemedText>
          </View>
        </View>

        {item.full_name && (
          <ThemedText style={styles.userName}>{item.full_name}</ThemedText>
        )}
        <View style={styles.userMeta}>
          <ThemedText style={styles.metaText}>
            <Ionicons name="calendar-outline" size={14} color={"#efefef"} />{" "}
            Registered:{" "}
            {new Intl.DateTimeFormat("default", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(new Date(item.created_at))}
          </ThemedText>
          <ThemedText style={styles.metaText}>
            <Ionicons name="time-outline" size={14} color={"#efefef"} /> Last
            login:{" "}
            {item.last_sign_in_at
              ? new Intl.DateTimeFormat("default", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(new Date(item.last_sign_in_at))
              : "Never"}
          </ThemedText>
        </View>
      </View>

      {item.id !== currentUser?.id && (
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: item.is_active ? "#F4433620" : "#4CAF5020",
              borderColor: item.is_active ? "#F44336" : "#4CAF50",
            },
          ]}
          onPress={() => toggleUserStatus(item.id, item.is_active ?? false)}
          disabled={isLoading}
        >
          <ThemedText
            style={[
              styles.toggleButtonText,
              { color: item.is_active ? "#f73b42" : "#efefef" },
            ]}
          >
            {item.is_active ? "Deactivate" : "Activate"}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <View
              style={{
                backgroundColor: "#efefef",
                padding: 12,
                borderRadius: 72,
              }}
            >
              <Ionicons name="arrow-back" size={24} color={"#000"} />
            </View>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Users
          </ThemedText>
          <View
            style={{
              padding: 12,
              borderRadius: 72,
            }}
          />
        </View>

        <View
          style={[
            styles.searchContainer,
            {
              outlineWidth: 0,
              backgroundColor: "#efefef",
              borderColor: "#94A3B8",
              borderWidth: 1,
            },
          ]}
        >
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons
              name="search"
              size={20}
              color={"#333"}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setDisplayedUsers(allUsers);
              }}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.placeholder}
              />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={displayedUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
            />
          }
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={52}
                color={colors.placeholder}
              />
              <ThemedText style={styles.emptyText}>No users found</ThemedText>
            </ThemedView>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerRight: {
    width: 24,
  },
  backButton: {
    padding: 4,
    zIndex: 1,
  },

  // Search
  searchContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    color: "#333",
    fontSize: 16,
    padding: 6,
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },

  // User List
  listContent: {
    paddingVertical: 16,
    paddingTop: 0,
  },

  // User Card
  userCard: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userEmail: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    color: "#efefef",
    marginBottom: 8,
    fontWeight: "500",
  },
  userMeta: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "transparent",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Toggle Button
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 10,
    alignSelf: "flex-end",
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginTop: 20,
  },
  loadingText: {
    color: "#666",
    marginTop: 16,
    fontSize: 15,
    fontWeight: "500",
  },
  metaText: {
    fontSize: 13,
    color: "#efefef",
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
  },
});
