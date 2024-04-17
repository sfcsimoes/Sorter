import React from "react";
import { StyleSheet, Pressable, Dimensions } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View, TextInput } from "@/components/Themed";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";

export default function TabOneScreen() {
  interface Order {
    id: String;
    createdAt: String;
    updatedAt: String;
    status: String;
  }
  const [text, onChangeText] = React.useState("Pesquisar encomenda aqui...");
  const [number, onChangeNumber] = React.useState("");
  const [orders, setOrders] = React.useState<Order[]>([]);

  React.useEffect(() => {
      fetch(process.env.EXPO_PUBLIC_API_URL + "/shipmentOrders")
        .then((resp) => resp.json())
        .then((json) => setOrders(json))
        .catch((error) => console.error(error));
        // .finally(() => setLoading(false));
  });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Encomendas Pendentes</Text>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
      />
      <View
        style={{
          marginTop: 8,
          flexGrow: 1,
          flexDirection: "row",
        }}
      >
        <FlashList
          data={orders}
          renderItem={({ item, index }) => {
            return (
              <>
                <Link href="/order" asChild>
                  <Pressable style={styles.list}>
                    <View style={{ flex: 4 }}>
                      <Text style={styles.title}>Encomenda {item.id}</Text>
                      <Text
                        style={styles.subTitle}
                        // className="text-muted-foreground"
                      >
                        {item.createdAt}
                      </Text>
                    </View>
                    <View style={{ flex: 2, justifyContent: "center" }}>
                      <Text style={styles.title}>{item.status}</Text>
                    </View>
                  </Pressable>
                </Link>

                <View
                  style={styles.separator}
                  lightColor="#eee"
                  darkColor="rgba(255,255,255,0.15)"
                />
              </>
            );
          }}
          estimatedItemSize={200}
        />
      </View>

      {/* <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      /> */}
      {/* <EditScreenInfo path="app/(tabs)/index.tsx" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    margin: "4%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
  },
  separator: {
    marginVertical: 15,
    height: 1,
    width: "95%",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "white",
    borderColor: "rgba(255,255,255,0.2)",
    width: "100%",
    borderRadius: 5,
  },
  list: {
    marginTop: 1,
    flexDirection: "row",
    width: "100%",
  },
});
