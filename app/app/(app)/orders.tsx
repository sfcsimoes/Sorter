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
import { Link, Stack, useNavigation } from "expo-router";
import { DatabaseHelper } from "@/db/database";
import { OrderStatus, ShipmentOrder, Warehouse } from "@/types/types";
import { useWarehouseStore } from "@/Stores/warehouseStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import BackgroundSync from "@/services/BackgroundSync";
import { format } from "date-fns";
import { ConnectionAlert } from "@/components/ConnectionAlert";
import {  useColorScheme } from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import Colors from "@/constants/Colors";
import Separator from "@/components/Separator";

export default function Orders() {
  const [text, onChangeText] = React.useState("");
  const [orders, setOrders] = React.useState<ShipmentOrder[]>([]);
  const [orderStatus, setOrderStatus] = React.useState<OrderStatus[]>([]);
  const [warehouse, setWarehouse] = React.useState<Warehouse>();
  const { warehouseId } = useWarehouseStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const colorScheme = useColorScheme();
  const value = new Date();

  // Navigation
  const navigation = useNavigation();

  // Effect
  React.useEffect(() => {
    navigation.addListener("focus", (e) => {
      if (e.type == "focus" && !refreshing) {
        setRefreshing(true);
      }
    });
  }, []);

  React.useEffect(() => {
    async function setup() {
      var db = new DatabaseHelper();
      if (warehouseId) {
        await db.syncWarehouses();
        setOrderStatus(await db.getOrderStatus());
        db.sendShipmentOrders();
        setWarehouse(await db.getWarehouse(warehouseId));
        const result = await db.getShipmentOrdersByOrigin(warehouseId);
        setOrders(result);
        try {
          await db.syncShipmentOrders(warehouseId);
        } catch (error) {}
        setRefreshing(false);
      }
    }
    setup();
  }, [warehouseId, refreshing]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  const [dateStart, setDateStart] = React.useState<Date>(new Date());
  const [dateEnd, setDateEnd] = React.useState<Date>(new Date());
  const [showDateEndText, setShowDateEndText] = React.useState(false);
  const [showDateStartText, setShowDateStartText] = React.useState(false);

  const onChange = (_event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setDateStart(currentDate);
  };

  const showDateStart = (currentMode: any) => {
    setShowDateStartText(true);
    DateTimePickerAndroid.open({
      value: dateStart,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const onChangeEnd = (_event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setDateEnd(currentDate);
  };

  const showDateEnd = (currentMode: any) => {
    setShowDateEndText(true);
    DateTimePickerAndroid.open({
      value: dateStart,
      onChange: onChangeEnd,
      mode: currentMode,
      is24Hour: true,
    });
  };

  let ordersFilter = React.useMemo(() => {
    if (text && text.length > 0) {
      return orders.filter((order) => {
        return (
          order.id.toString() == text &&
          new Date(order.createdAt) >= dateStart &&
          dateEnd >= new Date(order.createdAt)
        );
      });
    } else if (showFilters) {
      return orders.filter(
        (order) =>
          new Date(order.createdAt) >= dateStart &&
          dateEnd >= new Date(order.createdAt)
      );
    }
    return orders;
  }, [orders, text, dateStart, dateEnd]);

  return (
    <SafeAreaView>
      <BackgroundSync />
      <Stack.Screen
        options={{
          title: warehouse?.name || "Warehouse",
        }}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <ConnectionAlert body="No connection to the sorter." />

          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable
              style={{ marginStart: 6 }}
              onPress={() => {
                setShowFilters(!showFilters);
              }}
            >
              <FontAwesome
                name="filter"
                size={28}
                style={{
                  color:
                    colorScheme == "dark"
                      ? Colors.dark.text
                      : Colors.light.text,
                }}
              />
            </Pressable>

            <TextInput
              style={styles.input}
              placeholder="Order Number"
              placeholderTextColor={
                colorScheme == "dark" ? Colors.dark.text : Colors.light.text
              }
              onChangeText={onChangeText}
              value={text}
            />
          </View>
          {showFilters ? (
            <View style={{ marginStart: 8 }}>
              <View style={styles.row}>
                <FontAwesome
                  name="calendar"
                  size={22}
                  style={{
                    color:
                      colorScheme == "dark"
                        ? Colors.dark.text
                        : Colors.light.text,
                    paddingEnd: 8,
                  }}
                />
                <Pressable
                  onPress={() => {
                    showDateStart("date");
                  }}
                >
                  <TextInput
                    style={styles.dateInput}
                    placeholder="Start Date"
                    pointerEvents="none"
                    placeholderTextColor={
                      colorScheme == "dark"
                        ? Colors.dark.text
                        : Colors.light.text
                    }
                    editable={false}
                    selectTextOnFocus={false}
                    value={
                      showDateStartText ? format(dateStart, "dd/MM/yyyy") : ""
                    }
                  />
                </Pressable>
                <Text> - </Text>
                <Pressable
                  onPress={() => {
                    showDateEnd("date");
                  }}
                >
                  <TextInput
                    style={styles.dateInput}
                    placeholder="End Date"
                    pointerEvents="none"
                    placeholderTextColor={
                      colorScheme == "dark"
                        ? Colors.dark.text
                        : Colors.light.text
                    }
                    editable={false}
                    selectTextOnFocus={false}
                    value={showDateEndText ? format(dateEnd, "dd/MM/yyyy") : ""}
                  />
                </Pressable>
              </View>
            </View>
          ) : (
            <View></View>
          )}

          <View
            style={{
              marginTop: 8,
              flexGrow: 1,
              flexDirection: "row",
              minHeight: 100,
            }}
          >
            {ordersFilter.length > 0 ? (
              <FlashList
                data={ordersFilter}
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
                            <Text style={styles.title}>Order {item.id}</Text>
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
                      <Separator />
                    </>
                  );
                }}
                estimatedItemSize={200}
              />
            ) : (
              <Text style={styles.title}>No orders</Text>
            )}
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "90%",
    borderRadius: 5,
  },
  list: {
    marginTop: 1,
    flexDirection: "row",
    width: "100%",
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  dateInput: {
    height: 40,
    margin: 4,
    borderWidth: 1,
    padding: 10,
    // width: "90%",
    borderRadius: 5,
  },
  hourInput: {
    height: 40,
    margin: 4,
    borderWidth: 1,
    padding: 10,
    // width: "90%",
    borderRadius: 5,
  },
});
