import { View } from "./Themed";

export default function Separator() {
  return (
    <View
      style={{
        marginVertical: 10,
        height: 1,
        width: "95%",
      }}
      lightColor="#eee"
      darkColor="rgba(255,255,255,0.15)"
    />
  );
}
