import { View, Text } from "./Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useServerConnectionStore } from "@/Stores/serverConnectionStore";
import Colors from "@/constants/Colors";

export function DangerAlert(props: { body: string }) {
  const colorScheme = useColorScheme();
  const {
    hasConnection,
    showConnectionAlert,
    setShowConnectionAlert,
  } = useServerConnectionStore();
  var color = colorScheme === "dark" ? Colors.dark.text : Colors.light.text;

  if (!hasConnection && showConnectionAlert) {
    return (
      <View style={[{ borderColor: "white", borderWidth: 0.125 }, styles.card]}>
        <FontAwesome style={styles.icon} name="warning" size={20} />
        <Text style={styles.danger}>{props.body}</Text>
        <Pressable
          style={{ marginStart: "auto" }}
          onPress={() => {
            setShowConnectionAlert(false);
          }}
        >
          <FontAwesome style={[{ color }]} name="close" size={20} />
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  danger: {
    color: "rgba(239, 68, 68, 0.75)",
  },
  icon: {
    color: "rgba(239, 68, 68, 0.75)",
    marginEnd: 12,
  },
  card: {
    flexDirection: "row",
    borderRadius: 3,
    padding: 16,
    // shadowColor: "white",
    // backgroundColor: "white",
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    elevation: 14,
    width: "100%",
    // justifyContent: "center",
    // alignItems: "center",
    marginBottom: 6,
  },
});
