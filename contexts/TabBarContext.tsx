import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type TabBarContextType = {
  hideTabBar: () => void;
  showTabBar: () => void;
  isTabBarVisible: boolean;
};

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export const TabBarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const [stack, setStack] = useState<number>(0);

  const hideTabBar = useCallback(() => {
    //console.log("TabBarContext: Hiding tab bar");
    setStack((prev) => {
      const newStack = prev + 1;
      //console.log(`TabBarContext: Stack increased to ${newStack}`);
      return newStack;
    });
  }, []);

  const showTabBar = useCallback(() => {
    //console.log("TabBarContext: Showing tab bar");
    setStack((prev) => {
      const newStack = Math.max(0, prev - 1);
      //console.log(`TabBarContext: Stack decreased to ${newStack}`);
      return newStack;
    });
  }, []);

  // Update visibility based on stack and handle cleanup
  useEffect(() => {
    const shouldBeVisible = stack === 0;
    //console.log(`TabBarContext: Stack=${stack}, isTabBarVisible=${shouldBeVisible}`);

    // Only update if the visibility actually changes
    if (isTabBarVisible !== shouldBeVisible) {
      setIsTabBarVisible(shouldBeVisible);
    }

    // Reset stack when component unmounts to prevent memory leaks
    return () => {
      //console.log("TabBarContext: Cleaning up tab bar state");
      setStack(0);
      setIsTabBarVisible(true);
    };
  }, [stack, isTabBarVisible]);

  return (
    <TabBarContext.Provider value={{ hideTabBar, showTabBar, isTabBarVisible }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (context === undefined) {
    throw new Error("useTabBar must be used within a TabBarProvider");
  }
  return context;
};
