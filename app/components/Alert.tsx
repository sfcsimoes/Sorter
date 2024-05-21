import React from "react";
import { View, Text } from "./Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import Colors from "@/constants/Colors";

export function Alert(props: { show: boolean; type: string; body: string }) {
  const colorScheme = useColorScheme();
  const [show, setShow] = React.useState(props.show);

  React.useEffect(() => {setShow(props.show)}, [props]);

  var color = colorScheme === "dark" ? Colors.dark.text : Colors.light.text;

  let styles = StyleSheet.create({
    icon: {
      color: "rgba(239, 68, 68, 0.75)",
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

  switch (props.type) {
    case "danger":
      styles.icon.color = "rgba(239, 68, 68, 0.75)";
      break;
    case "warning":
      styles.icon.color = "rgb(255, 215, 0)";
      break;
    default:
      break;
  }

  if (show) {
    return (
      <View style={[{ borderColor: "white", borderWidth: 0.125 }, styles.card]}>
        <FontAwesome style={styles.icon} name="warning" size={20} />
        <Text>{props.body}</Text>
        <Pressable
          style={{ marginStart: "auto" }}
          onPress={() => {
            setShow(false);
          }}
        >
          <FontAwesome style={[{ color }]} name="close" size={20} />
        </Pressable>
      </View>
    );
  }
}
