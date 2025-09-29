import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import seedrandom from "seedrandom";

interface HealthMetrics {
  steps: number;
  water_intake: number;
  sleep_hours: number;
  emergency_contacts_count: number;
}

const getTodaysSeed = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (now.getHours() >= 7) {
    return today.getTime().toString();
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.getTime().toString();
  }
};
const generateRandomHealthMetrics = (date: Date) => {
  // Create a more unique seed by including hours and minutes
  const seed = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
  const rng = seedrandom(seed);

  // Generate random values with minimum thresholds
  const waterIntake = Math.max(1, Math.floor(rng() * 3 + 1)); // 1-3
  const sleepHours = Math.max(1, parseFloat((rng() * 4 + 5).toFixed(1))); // 5.0-9.0 with 1 decimal
  const steps = Math.max(1000, Math.floor(rng() * 4000 + 3000)); // 3000-6999

  return {
    water_intake: waterIntake,
    sleep_hours: sleepHours,
    steps: steps,
    emergency_contacts_count: 0, // This will be updated from the database
  };
};

// Function to clear stored metrics
const clearStoredMetrics = async () => {
  try {
    await AsyncStorage.removeItem("healthMetrics");
    await AsyncStorage.removeItem("healthMetricsDate");
    //console.log("Stored metrics cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing stored metrics:", error);
    return false;
  }
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || "light"];
  const { session, signOut, isLoading } = useAuthStore();
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    steps: 0,
    water_intake: 0,
    sleep_hours: 0,
    emergency_contacts_count: 0,
  });
  const [loading, setLoading] = useState(true);

  const user = session?.user || {
    email: "user@example.com",
    user_metadata: {
      full_name: "Guest User",
      avatar_url:
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },
  };

  const updateHealthMetrics = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Get current emergency contacts count
      const { count: contactsCount } = await supabase
        .from("emergency_contacts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      // Check if we have stored metrics for today
      const storedDate = await AsyncStorage.getItem("healthMetricsDate");
      let metrics = {
        water_intake: 0,
        sleep_hours: 0,
        steps: 0,
        emergency_contacts_count: contactsCount || 0,
      };

      if (storedDate && new Date(storedDate).getTime() === today.getTime()) {
        // Use stored metrics if they exist for today
        const storedMetrics = await AsyncStorage.getItem("healthMetrics");
        if (storedMetrics) {
          metrics = {
            ...metrics,
            ...JSON.parse(storedMetrics),
            // Always use the latest contacts count
            emergency_contacts_count: contactsCount || 0,
          };
        }
      } else {
        // Generate new random metrics for today
        const randomMetrics = generateRandomHealthMetrics(today);
        metrics = {
          ...randomMetrics,
          // Always use the latest contacts count
          emergency_contacts_count: contactsCount || 0,
        };

        // Store the new metrics and date
        await AsyncStorage.setItem("healthMetrics", JSON.stringify(metrics));
        await AsyncStorage.setItem("healthMetricsDate", today.toString());
      }

      // Update the database with the latest metrics
      if (session?.user?.id) {
        await supabase.from("health_metrics").upsert({
          ...metrics,
          user_id: session.user.id,
        });
      }

      // Update local state
      setHealthMetrics(metrics);
    } catch (error) {
      console.error("Error updating health metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Initial fetch
  useEffect(() => {
    updateHealthMetrics();
  }, [updateHealthMetrics]);

  // Set up real-time subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    const subscription = supabase
      .channel("health_metrics_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "health_metrics",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => updateHealthMetrics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [session?.user?.id, updateHealthMetrics]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const confirmLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: handleLogout },
    ]);
  };

  const stats = {
    workouts: 24,
    hours: 36,
    streak: 7,
  };

  const menuItems = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      icon: "✏️",
      onPress: () => router.push("/(app)/edit-profile"),
    },
    {
      id: "add-emergency-contact",
      title: "Add Emergency Contact",
      icon: "🆘",
      onPress: () => router.push("/(app)/add-emergency-contact"),
    },
    {
      id: "privacy",
      title: "Privacy",
      icon: "🔒",
      onPress: () => router.push("/(app)/privacy"),
    },
  ];

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "#f8f9fa" }}
    >
      <ThemedView style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarInitialsContainer}>
                <ThemedText style={styles.avatarInitials}>
                  {user.user_metadata?.full_name
                    ? user.user_metadata.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)
                    : "US"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>
                {user.user_metadata?.full_name || "Guest User"}
              </ThemedText>
              <ThemedText style={styles.userEmail}>{user.email}</ThemedText>

              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => router.push("/edit-profile")}
              >
                <ThemedText style={styles.editProfileButtonText}>
                  Edit Profile
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: "#e3f2fd" }]}>
              {loading ? (
                <ActivityIndicator size="small" color="#1976d2" />
              ) : (
                <ThemedText style={[styles.statValue, { color: "#1976d2" }]}>
                  {healthMetrics.steps.toLocaleString()}
                </ThemedText>
              )}
              <ThemedText style={[styles.statLabel, { color: "#1976d2" }]}>
                Steps
              </ThemedText>
              <Ionicons
                name="footsteps"
                size={20}
                color="#1976d2"
                style={styles.statIcon}
              />
            </View>

            <View style={[styles.statCard, { backgroundColor: "#e8f5e9" }]}>
              {loading ? (
                <ActivityIndicator size="small" color="#2e7d32" />
              ) : (
                <ThemedText style={[styles.statValue, { color: "#2e7d32" }]}>
                  {healthMetrics.water_intake.toFixed(1)}
                </ThemedText>
              )}
              <ThemedText style={[styles.statLabel, { color: "#2e7d32" }]}>
                Liters
              </ThemedText>
              <Ionicons
                name="water"
                size={20}
                color="#2e7d32"
                style={styles.statIcon}
              />
            </View>

            <View style={[styles.statCard, { backgroundColor: "#fff3e0" }]}>
              {loading ? (
                <ActivityIndicator size="small" color="#ef6c00" />
              ) : (
                <ThemedText style={[styles.statValue, { color: "#ef6c00" }]}>
                  {healthMetrics.sleep_hours.toFixed(1)}
                </ThemedText>
              )}
              <ThemedText style={[styles.statLabel, { color: "#ef6c00" }]}>
                Hours
              </ThemedText>
              <Ionicons
                name="moon"
                size={20}
                color="#ef6c00"
                style={styles.statIcon}
              />
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            <ThemedText style={styles.sectionTitle}>Account</ThemedText>
            <View style={styles.menuCard}>
              {menuItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuIconContainer}>
                      <ThemedText style={styles.menuItemIcon}>
                        {item.icon}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.menuItemText}>
                      {item.title}
                    </ThemedText>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9ca3af"
                      style={styles.chevronIcon}
                    />
                  </TouchableOpacity>
                  {index < menuItems.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.menuContainer}>
            <ThemedText style={styles.sectionTitle}>Support</ThemedText>
            <View style={styles.menuCard}>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Help & Support",
                    "Contact support@yourHealthApp.com for assistance."
                  )
                }
                style={styles.menuItem}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: "#e3f2fd" },
                  ]}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color="#1976d2"
                  />
                </View>
                <ThemedText style={styles.menuItemText}>
                  Help & Support
                </ThemedText>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#9ca3af"
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                onPress={() => router.push("/(app)/about")}
                style={styles.menuItem}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: "#e8f5e9" },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#2e7d32"
                  />
                </View>
                <ThemedText style={styles.menuItemText}>About App</ThemedText>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#9ca3af"
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#ef4444"
              style={styles.logoutIcon}
            />
            <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },

  // Profile Header
  profileHeader: {
    backgroundColor: "#fff",
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatarInitialsContainer: {
    height: 70,
    width: 80,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    backgroundColor: Colors.light.tint,
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: `${Colors.light.tint}15`,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Colors.light.tint}30`,
  },
  editProfileButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },

  // Stats Cards
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  statIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    opacity: 0.2,
  },

  // Menu
  menuContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as const,
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  } as const,
  menuItemIcon: {
    fontSize: 18,
  } as const,
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
  } as const,
  chevronIcon: {
    marginLeft: 8,
  } as const,
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginLeft: 60,
  } as const,

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutIcon: {
    marginRight: 8,
  } as const,
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  } as const,
});
