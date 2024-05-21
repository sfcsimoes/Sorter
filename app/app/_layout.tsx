import { Slot } from "expo-router";
import { SessionProvider } from "@/auth/ctx";
import React from "react";
import { DatabaseHelper } from "@/db/database";
import { useInterfaceStore } from "@/Stores/interfaceStore";
import { Appearance, useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations.js";
import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { View, Text } from "@/components/Themed";

export default function Root() {
  const expoDb = openDatabaseSync("db.db");
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);

  React.useEffect(() => {
    async function setup() {
      var db = new DatabaseHelper();
      await db.syncWarehouses();
      await db.syncUsers();
      await db.syncProducts();
      await db.syncOrderStatus();
    }
    setup();
  }, []);

  const { darkMode, setDarkMode } = useInterfaceStore();
  if (darkMode) {
    Appearance.setColorScheme("dark");
  } else {
    Appearance.setColorScheme("light");
  }
  const colorScheme = useColorScheme();

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Slot />
      </ThemeProvider>
    </SessionProvider>
  );
}
