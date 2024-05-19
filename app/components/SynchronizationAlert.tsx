import React from "react";

import { View, Text } from "./Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { useInterfaceStore } from "@/Stores/interfaceStore";
import Colors from "@/constants/Colors";

export function SynchronizationAlert(props: { body: string }) {
  const colorScheme = useColorScheme();
  const { showAlert, setShowAlert: setAlert } = useInterfaceStore();

  var color = colorScheme === "dark" ? Colors.dark.text : Colors.light.text;

  if (showAlert) {
    return (
      <View style={[{ borderColor: "white", borderWidth: 0.125 }, styles.card]}>
        <FontAwesome style={styles.icon} name="warning" size={20} />
        <Text>{props.body}</Text>
        <Pressable
          style={{ marginStart: "auto" }}
          onPress={() => {
            setAlert(false);
          }}
        >
          <FontAwesome style={[{ color }]} name="close" size={20} />
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    color: "rgb(255, 215, 0)",
    marginEnd: 12,
  },
  card: {
    flexDirection: "row",
    borderRadius: 3,
    padding: 16,
    elevation: 14,
    width: "100%",
    marginBottom: 6,
  },
});
