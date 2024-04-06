import React from "react";
import { Text, StyleSheet, Pressable } from "react-native";

export default function StyledButton(props: {
  onPress: any;
  title?: string | undefined;
  icon?: any;
  variant: string | undefined;
}) {
  const { onPress, title, icon, variant = "default" } = props;

  type TitleParameter = {
    title: string | undefined;
  };

  function Title({ title }: TitleParameter) {
    if (title) {
      return (
        <>
          <Text style={styles.text}>{title}</Text>
        </>
      );
    }
  }

  function Variant(variant: string | undefined) {
    switch (variant) {
      case "default":
        return styles.button;
      case "secondary":
        return styles.buttonTwo;
      default:
        return styles.button;
    }
  }

  return (
    <Pressable style={Variant(variant)} onPress={onPress}>
      <Title title={title} />
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "white",
  },
  buttonTwo: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "red",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "black",
  },
});
