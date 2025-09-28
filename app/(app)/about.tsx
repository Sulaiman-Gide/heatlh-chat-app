import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Health Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);

  const router = useRouter();

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const navigateToScreen = (path: string) => {
    router.push(path as any);
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "I'm here to help with any questions about the app or your health.",
        "You can ask me about features, settings, or general health advice.",
        "For medical emergencies, please contact emergency services immediately.",
        "I'm constantly learning to provide better assistance. How can I help?",
        "You can find more information in our FAQ section.",
      ];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          About & Support
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ThemedView style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          <View style={styles.header}>
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: colors.tint + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="heart-pulse"
                size={48}
                color={colors.tint}
              />
            </View>
            <ThemedText style={styles.appName}>HealthGuard Pro</ThemedText>
            <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Our Mission</ThemedText>
            <ThemedText style={styles.sectionText}>
              We're dedicated to revolutionizing healthcare accessibility
              through technology. Our goal is to provide immediate, reliable
              health support when you need it most, connecting you with
              emergency services and healthcare professionals seamlessly.
            </ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Key Features</ThemedText>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.tint + "20" },
                ]}
              >
                <MaterialIcons
                  name="medical-services"
                  size={20}
                  color={colors.tint}
                />
              </View>
              <View style={styles.featureTextContainer}>
                <ThemedText style={styles.featureTitle}>
                  Health Monitoring
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Track vital signs and receive personalized health insights
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.tint + "20" },
                ]}
              >
                <MaterialIcons name="emergency" size={20} color={colors.tint} />
              </View>
              <View style={styles.featureTextContainer}>
                <ThemedText style={styles.featureTitle}>
                  Emergency Response
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Instant alerts to emergency contacts with your precise
                  location
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.tint + "20" },
                ]}
              >
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color={colors.tint}
                />
              </View>
              <View style={styles.featureTextContainer}>
                <ThemedText style={styles.featureTitle}>
                  Location Tracking
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  Real-time location sharing during emergencies
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Get In Touch</ThemedText>
            <TouchableOpacity
              style={[styles.contactButton, { borderColor: colors.border }]}
              onPress={() => openLink("mailto:support@healthguard.com")}
            >
              <MaterialIcons name="email" size={20} color={colors.text} />
              <ThemedText style={styles.contactButtonText}>
                Email Support
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactButton, { borderColor: colors.border }]}
              onPress={() => openLink("tel:+1234567890")}
            >
              <MaterialIcons name="phone" size={20} color={colors.text} />
              <ThemedText style={styles.contactButtonText}>
                +234 8056088068
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.socialLinks}>
              <TouchableOpacity
                style={[
                  styles.socialIcon,
                  { backgroundColor: colors.tint + "20" },
                ]}
                onPress={() => openLink("https://twitter.com/healthguard")}
              >
                <FontAwesome name="twitter" size={20} color={colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.socialIcon,
                  { backgroundColor: colors.tint + "20" },
                ]}
                onPress={() => openLink("https://facebook.com/healthguard")}
              >
                <FontAwesome name="facebook-f" size={20} color={colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.socialIcon,
                  { backgroundColor: colors.tint + "20" },
                ]}
                onPress={() => openLink("https://instagram.com/healthguard")}
              >
                <FontAwesome name="instagram" size={20} color={colors.tint} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Legal</ThemedText>
            <TouchableOpacity
              style={styles.legalLink}
              onPress={() => navigateToScreen("/(app)/privacy")}
            >
              <ThemedText
                style={[styles.legalLinkText, { color: colors.tint }]}
              >
                Privacy Policy
              </ThemedText>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.legalLink}>
              <ThemedText
                style={[styles.legalLinkText, { color: colors.tint }]}
              >
                Terms of Service
              </ThemedText>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.legalLink}>
              <ThemedText
                style={[styles.legalLinkText, { color: colors.tint }]}
              >
                Open Source Licenses
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={[styles.copyright, { color: colors.text }]}>
            © {new Date().getFullYear()} HealthGuard Pro. All rights reserved.
          </ThemedText>
        </ScrollView>

        {/* Chat Interface */}
        <View style={[styles.chatContainer, { borderTopColor: colors.border }]}>
          <View style={styles.messagesContainer}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.sender === "user"
                      ? [styles.userMessage, { backgroundColor: colors.tint }]
                      : [styles.botMessage, { backgroundColor: colors.card }],
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.messageText,
                      item.sender === "user" ? styles.userMessageText : {},
                    ]}
                  >
                    {item.text}
                  </ThemedText>
                </View>
              )}
              contentContainerStyle={styles.messagesList}
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, backgroundColor: colors.card },
              ]}
              placeholder="Type your message..."
              placeholderTextColor={colors.text + "80"}
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.tint }]}
              onPress={handleSendMessage}
            >
              <MaterialIcons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const { width: screenWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: 8,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 0,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    padding: 16,
    paddingBottom: 200,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    opacity: 0.7,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  teamContainer: {
    paddingVertical: 8,
  },
  teamMember: {
    width: 100,
    alignItems: "center",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  memberName: {
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  contactButtonText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  socialLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legalLink: {
    paddingVertical: 12,
  },
  legalLinkText: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 8,
  },
  copyright: {
    textAlign: "center",
    marginTop: 24,
    opacity: 0.6,
    fontSize: 12,
  },
  // Chat styles
  chatContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 20,
    maxHeight: "40%",
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 8,
  },
  messagesList: {
    padding: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 15,
    borderRadius: 24,
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
