import { router } from "expo-router";

import React from "react";
import { useSession } from "@/auth/ctx";
import { StyleSheet, useColorScheme } from "react-native";
import { Text, TextInput, View, Button } from "@/components/Themed";
import StyledButton from "@/components/StyledButton";
import { Image } from "expo-image";

export default function SignIn() {
  const { signIn } = useSession();
  const [email, onChangeEmail] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Image
        source={
          colorScheme == "dark"
            ? require("@/assets/images/logo_white.png")
            : require("@/assets/images/logo.png")
        }
        style={styles.image}
        contentFit="none"
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoComplete="email"
        textContentType="emailAddress"
        onChangeText={onChangeEmail}
        value={email}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={onChangePassword}
        autoComplete="password"
        textContentType="password"
        secureTextEntry={true}
        value={password}
      />

      <View style={{ width: "100%", marginTop: 14 }}>
        <StyledButton
          onPress={async () => {
            var result = await signIn(email, password);
            if (result) {
              router.replace("/");
            }
            // Navigate after signing in. You may want to tweak this to ensure sign-in is
            // successful before navigating.
            //
          }}
          title="Login"
          variant="default"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: "4%",
  },
  label: {
    fontSize: 22,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "100%",
    borderRadius: 5,
  },
  image: {
    width: "100%",
    height: "25%",
    marginBottom: 36,
  },
});
