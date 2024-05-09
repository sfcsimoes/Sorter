import React from "react";
import { StyleSheet, Pressable } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View, TextInput } from "@/components/Themed";
import { FlashList } from "@shopify/flash-list";
import { Link, useNavigation } from "expo-router";
import { Stack } from "expo-router";
import { DatabaseHelper } from "@/db/database";
import { OrderStatus, ShipmentOrder, Warehouse } from "@/types/types";
import { useWarehouseStore } from "@/Stores/warehouseStore";


export default function TabOneScreen() {
  const [text, onChangeText] = React.useState("Nº Encomenda");
  const [number, onChangeNumber] = React.useState("");
  const [orders, setOrders] = React.useState<ShipmentOrder[]>([]);
  const [orderStatus, setOrderStatus] = React.useState<OrderStatus[]>([]);
  const [warehouse, setWarehouse] = React.useState<Warehouse>();
  const { warehouseId, setWarehouseId } = useWarehouseStore();

  React.useEffect(() => {
    async function setup() {
      var db = new DatabaseHelper();
      if (warehouseId) {
        setWarehouse(await db.getWarehouse(warehouseId));
        db.syncShipmentOrders(warehouseId);
        const result = await db.getShipmentOrders(warehouseId);
        setOrderStatus(await db.getOrderStatus());
        setOrders(result);
      }
    }
    setup();
  }, [warehouseId]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: warehouse?.name || "s",
        }}
      />
      <Text style={styles.title}>Encomendas</Text>
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
                <Link
                  href={{
                    pathname: "/order",
                    params: { id: item.id.toString() },
                  }}
                  asChild
                >
                  <Pressable style={styles.list}>
                    <View style={{ flex: 4 }}>
                      <Text style={styles.title}>Encomenda {item.id}</Text>
                      <Text style={styles.subTitle}>{item.createdAt}</Text>
                    </View>
                    <View style={{ flex: 2, justifyContent: "center" }}>
                      <Text style={styles.title}>
                        {orderStatus.find((i) => i.id == item.statusId)?.name}
                      </Text>
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
    padding: "4%",
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
