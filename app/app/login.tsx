import { router } from "expo-router";

import React from "react";
import { useSession } from "@/auth/ctx";
import { StyleSheet, useColorScheme } from "react-native";
import { Text, TextInput, View, Button } from "@/components/Themed";
import StyledButton from "@/components/StyledButton";
import { Image } from "expo-image";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/Alert";

export default function Login() {
  const { signIn } = useSession();
  const colorScheme = useColorScheme();
  const [show, setShow] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
      var result = await signIn(data.email, data.password);
      if (result) {
        router.replace("/");
      }else{
        setShow(true);
        setServerError("Invalid Credentials");
      }
  };

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
      <Alert show={show} type="danger" body={serverError} />
      <Text style={styles.label}>Email</Text>
      <Controller
        control={form.control}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              value={value}
              placeholder="Email"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <Text style={styles.errorText}>
              {form.formState.errors.email?.message}
            </Text>
          </>
        )}
        name="email"
        rules={{ required: true }}
      />

      <Text style={styles.label}>Password</Text>
      <Controller
        control={form.control}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              value={value}
              autoComplete="password"
              textContentType="password"
              secureTextEntry={true}
            />
            <Text style={styles.errorText}>
              {form.formState.errors.password?.message}
            </Text>
          </>
        )}
        name="password"
        rules={{ required: true }}
      />

      <View style={{ width: "100%", marginTop: 14 }}>
        <StyledButton
          onPress={form.handleSubmit(onSubmit)}
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
  errorText: {
    color: "rgba(239, 68, 68, 0.75)",
  },
  image: {
    width: "100%",
    height: "25%",
    marginBottom: 36,
  },
});
