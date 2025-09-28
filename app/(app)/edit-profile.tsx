import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    seasonal_allergies?: string[];
    medications?: string[];
    blood_type?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  };
};

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { session, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [seasonalAllergies, setSeasonalAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  useEffect(() => {
    if (session?.user) {
      setFullName(session.user.user_metadata?.full_name || "");
      setEmail(session.user.email || "");
      setSeasonalAllergies(
        session.user.user_metadata?.seasonal_allergies?.join(", ") || ""
      );
      setMedications(session.user.user_metadata?.medications?.join(", ") || "");
      setBloodType(session.user.user_metadata?.blood_type || "");
      setEmergencyContactName(
        session.user.user_metadata?.emergency_contact_name || ""
      );
      setEmergencyContactPhone(
        session.user.user_metadata?.emergency_contact_phone || ""
      );
    }
  }, [session]);

  const handleSave = async () => {
    if (!session) {
      Alert.alert("Error", "You must be logged in to update your profile");
      router.push("/(auth)/login");
      return;
    }

    try {
      setLoading(true);

      // Process allergies and medications into arrays
      const allergiesArray = seasonalAllergies
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const medicationsArray = medications
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const { error } = await updateProfile({
        full_name: fullName,
        seasonal_allergies: allergiesArray,
        medications: medicationsArray,
        blood_type: bloodType,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
      });

      if (error) {
        console.error("Profile update error:", error);
        throw new Error(error.message || "Failed to update profile");
      }

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Error", `Failed to update profile: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#fff" }]}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Edit Profile
          </ThemedText>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedView style={styles.card}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Personal Information
              </ThemedText>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="person-outline" size={20} color="#6b7280" />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={[styles.inputContainer, { marginBottom: 0 }]}>
                <View style={styles.inputIcon}>
                  <Ionicons name="water-outline" size={20} color="#6b7280" />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={bloodType}
                  onChangeText={setBloodType}
                  placeholder="Blood type (e.g., A+, O-)"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </ThemedView>

            <ThemedView style={[styles.card, { marginTop: 16 }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Health Information
              </ThemedText>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="flower-outline" size={20} color="#6b7280" />
                </View>
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text, marginTop: 34, marginLeft: 3 },
                  ]}
                  value={seasonalAllergies}
                  onChangeText={setSeasonalAllergies}
                  placeholder="Seasonal allergies (comma separated)"
                  placeholderTextColor="#9ca3af"
                  multiline
                />
              </View>

              <View style={[styles.inputContainer, { marginBottom: 0 }]}>
                <View style={styles.inputIcon}>
                  <Ionicons name="medical-outline" size={20} color="#6b7280" />
                </View>
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text, marginTop: 34, marginLeft: 3 },
                  ]}
                  value={medications}
                  onChangeText={setMedications}
                  placeholder="Current medications (comma separated)"
                  placeholderTextColor="#9ca3af"
                  multiline
                />
              </View>
            </ThemedView>

            <ThemedView
              style={[styles.card, { marginTop: 16, marginBottom: 24 }]}
            >
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Emergency Contact
              </ThemedText>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="person-circle-outline"
                    size={20}
                    color="#6b7280"
                  />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={emergencyContactName}
                  onChangeText={setEmergencyContactName}
                  placeholder="Contact name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={[styles.inputContainer, { marginBottom: 0 }]}>
                <View style={styles.inputIcon}>
                  <Ionicons name="call-outline" size={20} color="#6b7280" />
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={emergencyContactPhone}
                  onChangeText={setEmergencyContactPhone}
                  placeholder="Contact phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
            </ThemedView>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.tint,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.saveButtonText}>
                  Save Changes
                </ThemedText>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center" as const,
    flex: 1,
    color: "#1f2937",
  },
  headerRight: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 16,
    paddingHorizontal: 4,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
    paddingVertical: 0,
    fontFamily: "System",
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 8,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
