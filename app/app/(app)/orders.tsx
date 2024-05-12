import React from "react";
import {
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";

import { Text, TextInput, View } from "@/components/Themed";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { Stack } from "expo-router";
import { DatabaseHelper } from "@/db/database";
import { OrderStatus, ShipmentOrder, Warehouse } from "@/types/types";
import { useWarehouseStore } from "@/Stores/warehouseStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import BackgroundSync from "@/services/BackgroundSync";
import { format } from "date-fns";
import { DangerAlert } from "@/components/DangerAlert";

export default function Orders() {
  const [text, onChangeText] = React.useState("Nº Encomenda");
  const [number, onChangeNumber] = React.useState("");
  const [orders, setOrders] = React.useState<ShipmentOrder[]>([]);
  const [orderStatus, setOrderStatus] = React.useState<OrderStatus[]>([]);
  const [warehouse, setWarehouse] = React.useState<Warehouse>();
  const { warehouseId, setWarehouseId } = useWarehouseStore();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    async function setup() {
      var db = new DatabaseHelper();
      if (warehouseId) {
        setOrderStatus(await db.getOrderStatus());
        db.sendShipmentOrders();

        await db.syncShipmentOrders(warehouseId);
        setWarehouse(await db.getWarehouse(warehouseId));
        const result = await db.getShipmentOrders(warehouseId);
        setOrders(result);
        setRefreshing(false);
      }
    }
    setup();
  }, [warehouseId, refreshing]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  return (
    <SafeAreaView>
      {/* <BackgroundSync /> */}
      <Stack.Screen
        options={{
          title: warehouse?.name || "Armazem",
        }}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <DangerAlert body="Sem ligação ao sorter." />
          
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
                          <Text style={styles.subTitle}>
                            {format(
                              new Date(item.createdAt),
                              "dd/MM/yyyy hh:mm"
                            )}
                          </Text>
                        </View>
                        <View style={{ flex: 2, justifyContent: "center" }}>
                          <Text style={styles.title}>
                            {
                              orderStatus.find((i) => i.id == item.statusId)
                                ?.name
                            }
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
        </View>
      </ScrollView>
    </SafeAreaView>
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
    width: "100%",
    borderRadius: 5,
  },
  list: {
    marginTop: 1,
    flexDirection: "row",
    width: "100%",
  },
});
