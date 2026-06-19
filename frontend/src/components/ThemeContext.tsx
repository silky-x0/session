import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark" | "contrast";

export interface EditorSettings {
  fontSize: number;
  lineHeight: number;
  minimap: boolean;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  settings: EditorSettings;
  updateSettings: (newSettings: Partial<EditorSettings>) => void;
  zenMode: boolean;
  setZenMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("session-theme");
    return (stored as Theme) || "dark";
  });

  const [settings, setSettings] = useState<EditorSettings>(() => {
    const stored = localStorage.getItem("session-editor-settings");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse editor settings", e);
      }
    }
    return {
      fontSize: 14,
      lineHeight: 1.6,
      minimap: true,
    };
  });

  const [zenMode, setZenMode] = useState(false);

  // Apply theme class to document body/documentElement whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark", "theme-high-contrast", "dark");
    
    if (theme === "light") {
      root.classList.add("theme-light");
    } else if (theme === "contrast") {
      root.classList.add("theme-high-contrast", "dark");
    } else {
      root.classList.add("theme-dark", "dark");
    }
  }, [theme]);


  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("session-theme", newTheme);
  };

  const updateSettings = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("session-editor-settings", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        settings,
        updateSettings,
        zenMode,
        setZenMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
