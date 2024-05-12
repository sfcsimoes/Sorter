import { Slot } from "expo-router";
import { SessionProvider } from "@/auth/ctx";
import React from "react";
import { DatabaseHelper } from "@/db/database";
import { useDarkModeStore } from "@/Stores/darkModeStore";
import { Appearance, useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

export default function Root() {
  var db = new DatabaseHelper();
  // db.dropDatabase();
  db.Migration();
  React.useEffect(() => {
    async function setup() {
      var db = new DatabaseHelper();
      await db.syncWarehouses();
      await db.syncProducts();
      await db.syncOrderStatus();
    }
    setup();
  }, []);
  // Set up the auth context and render our layout inside of it.

  const { darkMode, setDarkMode } = useDarkModeStore();
  if (darkMode) {
    Appearance.setColorScheme("dark");
  } else {
    Appearance.setColorScheme("light");
  }
  const colorScheme = useColorScheme();
  
  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Slot />
      </ThemeProvider>
    </SessionProvider>
  );
}
