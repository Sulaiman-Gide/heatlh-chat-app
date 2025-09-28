import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onPress: () => void;
}

const Section = ({ title, children, isExpanded, onPress }: SectionProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.section, { borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <ThemedText style={[styles.sectionTitle, { color: colors.tint }]}>
          {title}
        </ThemedText>
        <MaterialIcons
          name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-right"}
          size={24}
          color={colors.tint}
        />
      </TouchableOpacity>
      {isExpanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

export default function PrivacyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    introduction: true,
    dataCollection: false,
    dataUsage: false,
    dataSharing: false,
    security: false,
    yourRights: false,
    changes: false,
    contact: false,
  });

  const toggleSection = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const openEmail = () => {
    Linking.openURL("mailto:privacy@healthguard.com");
  };

  const scrollToSection = (section: string) => {
    // Implementation for smooth scrolling to section
    // This is a simplified version - you might need to adjust based on your layout
    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
    toggleSection(section);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View
        style={[styles.headerContainer, { borderBottomColor: colors.border }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText
          type="title"
          style={[styles.headerTitle, { color: colors.text }]}
        >
          Privacy Policy
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.hero}>
            <ThemedText style={[styles.heroTitle, { color: colors.tint }]}>
              Your Privacy Matters
            </ThemedText>
            <ThemedText style={[styles.heroSubtitle, { color: colors.text }]}>
              Last updated: 24th September 2025
            </ThemedText>
          </View>

          <View style={styles.tocContainer}>
            <ThemedText style={[styles.tocTitle, { color: colors.text }]}>
              Table of Contents
            </ThemedText>
            {Object.keys(expandedSections).map((section) => (
              <Pressable
                key={section}
                style={[styles.tocItem, { borderLeftColor: colors.tint }]}
              >
                <ThemedText style={[styles.tocText, { color: colors.text }]}>
                  {section
                    .split(/(?=[A-Z])/)
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <Section
            title="1. Introduction"
            isExpanded={expandedSections.introduction}
            onPress={() => toggleSection("introduction")}
          >
            <ThemedText style={[styles.paragraph, { color: colors.text }]}>
              Your privacy is important to us. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you
              use our Health App.
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Information We Collect
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              We may collect personal information that you voluntarily provide
              to us when you register with the App, express an interest in
              obtaining information about us or our products and services, or
              otherwise when you contact us.
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              How We Use Your Information
            </ThemedText>
            <ThemedText style={styles.paragraph}>
              We use the information we collect or receive to provide you with
              the services you request, to improve our services, and to
              communicate with you.
            </ThemedText>
            <ThemedText style={[styles.paragraph, { color: colors.text }]}>
              At HealthGuard, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our application.
            </ThemedText>
          </Section>

          <Section
            title="2. Information We Collect"
            isExpanded={expandedSections.dataCollection}
            onPress={() => toggleSection("dataCollection")}
          >
            <ThemedText style={[styles.paragraph, { color: colors.text }]}>
              We collect various types of information to provide and improve our
              service to you, including:
            </ThemedText>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                Personal Information: Name, email, date of birth, and contact
                details
              </ThemedText>
            </View>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                Health Data: Medical history, symptoms, and treatment
                information
              </ThemedText>
            </View>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                Usage Data: How you interact with our app and services
              </ThemedText>
            </View>
          </Section>

          <Section
            title="3. How We Use Your Information"
            isExpanded={expandedSections.dataUsage}
            onPress={() => toggleSection("dataUsage")}
          >
            <ThemedText style={[styles.paragraph, { color: colors.text }]}>
              We use the information we collect for various purposes, including:
            </ThemedText>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                To provide and maintain our service
              </ThemedText>
            </View>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                To notify you about changes to our service
              </ThemedText>
            </View>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                To provide customer support
              </ThemedText>
            </View>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                To monitor the usage of our service
              </ThemedText>
            </View>
          </Section>

          <Section
            title="4. Data Sharing and Disclosure"
            isExpanded={expandedSections.dataSharing}
            onPress={() => toggleSection("dataSharing")}
          >
            <ThemedText style={[styles.paragraph, { color: colors.text }]}>
              We may share your personal information in the following
              situations:
            </ThemedText>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                With healthcare providers for treatment purposes
              </ThemedText>
            </View>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                For legal compliance and law enforcement requests
              </ThemedText>
            </View>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                With service providers who perform services on our behalf
              </ThemedText>
            </View>
          </Section>

          <Section
            title="5. Data Security"
            isExpanded={expandedSections.security}
            onPress={() => toggleSection("security")}
          >
            <ThemedText style={[styles.paragraph, { color: colors.text }]}>
              We implement appropriate technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the Internet or electronic storage is 100%
              secure, and we cannot guarantee absolute security.
            </ThemedText>
          </Section>

          <Section
            title="6. Your Rights"
            isExpanded={expandedSections.yourRights}
            onPress={() => toggleSection("yourRights")}
          >
            <ThemedText style={[styles.paragraph, { color: colors.text }]}>
              You have the right to:
            </ThemedText>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                Access, update, or delete your personal information
              </ThemedText>
            </View>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                Object to our processing of your personal data
              </ThemedText>
            </View>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                Request restriction of processing your personal information
              </ThemedText>
            </View>
            <View style={styles.listItem}>
              <View
                style={[styles.bulletPoint, { backgroundColor: colors.tint }]}
              />
              <ThemedText style={[styles.listText, { color: colors.text }]}>
                Data portability
              </ThemedText>
            </View>
          </Section>

          <Section
            title="7. Changes to This Privacy Policy"
            isExpanded={expandedSections.changes}
            onPress={() => toggleSection("changes")}
          >
            <ThemedText style={[styles.paragraph, { color: colors.text }]}>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date.
            </ThemedText>
          </Section>

          <Section
            title="8. Contact Us"
            isExpanded={expandedSections.contact}
            onPress={() => toggleSection("contact")}
          >
            <ThemedText style={[styles.paragraph, { color: colors.text }]}>
              If you have any questions about this Privacy Policy, please
              contact us:
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.contactButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={openEmail}
            >
              <Ionicons name="mail" size={20} color={colors.tint} />
              <ThemedText
                style={[styles.contactButtonText, { color: colors.tint }]}
              >
                privacy@healthguard.com
              </ThemedText>
            </TouchableOpacity>
          </Section>

          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: colors.text }]}>
              © {new Date().getFullYear()} HealthGuard Pro. All rights reserved.
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
    fontSize: 20,
    fontWeight: "600",
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 0,
  },
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  hero: {
    marginBottom: 24,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  tocContainer: {
    marginBottom: 24,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    padding: 16,
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  tocItem: {
    paddingVertical: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    marginBottom: 4,
  },
  tocText: {
    fontSize: 15,
  },
  section: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  contactButtonText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
