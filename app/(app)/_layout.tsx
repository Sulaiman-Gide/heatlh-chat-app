import { HapticTab } from "@/components/haptic-tab";
import { getThemeColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useTabBar } from "@/contexts/TabBarContext";

interface TabBarIconProps {
  focused: boolean;
  source: any;
  size?: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({
  focused,
  source,
  size = 28,
}) => (
  <View style={styles.tabIconContainer}>
    <View style={[styles.iconWrapper]}>
      <Image
        source={source}
        style={[
          styles.tabIcon,
          {
            width: size,
            height: size,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  </View>
);

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const colors = getThemeColors(colorScheme);

  const { isTabBarVisible } = useTabBar();
  const [tabBarHeight, setTabBarHeight] = useState(80);
  
  // Debug: Log tab bar visibility changes
  useEffect(() => {
    console.log('Tab bar visibility changed:', isTabBarVisible);
  }, [isTabBarVisible]);

  const tabBarStyle = {
    backgroundColor: "#696c70",
    position: "absolute" as const,
    left: 20,
    right: 20,
    bottom: 40,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    overflow: "hidden" as const,
    marginHorizontal: 15,
    paddingTop: 8,
    paddingHorizontal: 8,
    display: isTabBarVisible ? 'flex' : 'none',
    opacity: isTabBarVisible ? 1 : 0,
    transform: [
      { translateY: isTabBarVisible ? 0 : 20 },
    ],
    // Add transition for smooth animation
    transition: 'opacity 300ms, transform 300ms',
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          ...tabBarStyle,
          display: "flex",
        },
        tabBarItemStyle: {
          height: 80,
          padding: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 12,
          marginBottom: 4,
        },
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              source={require("@/assets/images/home.png")}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat-screen"
        options={{
          title: "Chats",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              source={require("@/assets/images/chatbox.png")}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat-detail"
        options={{
          title: "Chat",
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Contacts",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              source={require("@/assets/images/phone.png")}
              size={26}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              source={require("@/assets/images/profile.png")}
              size={24}
            />
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen
        name="add-emergency-contact"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="edit-emergency-contact"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    position: "relative",
    paddingTop: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconWrapperFocused: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3B82F6",
  },
});
