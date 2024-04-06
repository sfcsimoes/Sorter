import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { useColorScheme } from '@/components/useColorScheme';
import { RootSiblingParent } from "react-native-root-siblings";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const toastConfig = {
    /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
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
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
        <Toast config={toastConfig} />
      </RootSiblingParent>
    </ThemeProvider>
  );
}
