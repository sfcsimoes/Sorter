import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, Redirect, Link } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { useColorScheme } from "@/components/useColorScheme";
import { RootSiblingParent } from "react-native-root-siblings";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite/next";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import { View, Text, Button } from "react-native";
import { useSession } from "@/auth/ctx";

const expoDb = openDatabaseSync("db.db");
const db = drizzle(expoDb);

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, isLoading } = useSession();
  const [loaded, error] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

   if (isLoading) {
     return <Text>Loading...</Text>;
   }

   // Only require authentication within the (app) group's layout as users
   // need to be able to access the (auth) group and sign in again.
   if (!session) {
     // On web, static rendering will stop here as the user is not authenticated
     // in the headless Node process that the pages are rendered in.
     return <Redirect href="/login" />;
   }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: "#69C779",
          backgroundColor:
            colorScheme === "dark" ? DarkTheme.colors.background : "white",
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontWeight: "400",
          color: colorScheme === "dark" ? DarkTheme.colors.text : "black",
        }}
      />
    ),
    /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: "#FE6301",
          backgroundColor:
            colorScheme === "dark" ? DarkTheme.colors.background : "white",
        }}
        text1Style={{
          fontSize: 17,
          color: colorScheme === "dark" ? DarkTheme.colors.text : "black",
        }}
        text2Style={{
          fontSize: 15,
        }}
      />
    ),
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <RootSiblingParent>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Armazens",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="orders"
            options={{
              headerShown: true,
              headerRight: () => (
                <Link asChild href={"/modal"}>
                  <FontAwesome
                    name="cog"
                    size={24}
                    color={
                      colorScheme === "dark"
                        ? DarkTheme.colors.text
                        : DefaultTheme.colors.text
                    }
                  />
                </Link>
              ),
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: "modal", title: 'Settings' }} />
        </Stack>
        <Toast config={toastConfig} />
      </RootSiblingParent>
    </ThemeProvider>
  );
}
