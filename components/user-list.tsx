import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type User = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
};

export default function UserListScreen({
  onSelectUser,
  filterUser,
}: {
  onSelectUser: (userId: string) => void;
  filterUser?: (user: User) => boolean;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url");
      if (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } else {
        setUsers(data || []);
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  // Helper to get initials (first and last letter)
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return (
        parts[0][0] + (parts[0][parts[0].length - 1] || "")
      ).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper to get a random pastel color based on user id
  const getColor = (id: string) => {
    const colors = [
      "#FFD700", // gold
      "#FFB347", // orange
      "#87CEEB", // sky blue
      "#77DD77", // green
      "#FF6961", // red
      "#C299FC", // purple
      "#F49AC2", // pink
      "#AEC6CF", // blue gray
      "#B0E57C", // light green
      "#FFCCCB", // light red
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const filteredUsers = filterUser ? users.filter(filterUser) : users;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
          Contacts List
        </ThemedText>
      </View>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              console.log(
                "[UserListScreen] Contact pressed:",
                item.id,
                item.full_name
              );
              onSelectUser(item.id);
            }}
          >
            <View style={styles.row}>
              <View
                style={[styles.avatar, { backgroundColor: getColor(item.id) }]}
              >
                <ThemedText style={styles.avatarText}>
                  {getInitials(item.full_name)}
                </ThemedText>
              </View>
              <View style={styles.info}>
                <ThemedText style={styles.name}>
                  {item.full_name || item.id}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<ThemedText>No users found</ThemedText>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#eeeded9e",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 17,
    fontWeight: "500",
    color: "#222",
  },
});
