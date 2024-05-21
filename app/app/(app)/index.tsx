import React from "react";
import { StyleSheet, Pressable, Dimensions } from "react-native";
import { Text, View } from "@/components/Themed";
import { FlashList } from "@shopify/flash-list";
import { Redirect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DatabaseHelper } from "@/db/database";

import { Warehouse } from "@/types/types";
import { useWarehouseStore } from "@/Stores/warehouseStore";

export default function TabOneScreen() {
  const [localWarehouses, setLocalWarehouses] = React.useState<
    Warehouse[]
  >([]);
  const { warehouseId, setWarehouseId } = useWarehouseStore();

  React.useEffect(() => {
    async function setup() {
      var db = new DatabaseHelper();
      await db.syncWarehouses();
      const result = await db.getWarehouses();
      setLocalWarehouses(result);
    }
    setup();
  }, []);

  if (warehouseId) {
    return (
      <Redirect
        href={{
          pathname: "/orders",
          params: { id: warehouseId },
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <FontAwesome name="home" size={24} />
        Warehouses
      </Text>
      <View
        style={{
          marginTop: 8,
          flexGrow: 1,
          flexDirection: "row",
        }}
      >
        <FlashList
          data={localWarehouses}
          renderItem={({ item, index }) => {
            return (
              <>
                <Pressable
                  style={styles.list}
                  onPress={() => {
                    setWarehouseId(item.id);
                  }}
                >
                  <View style={{ flex: 4 }}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.subTitle}>{item.address}</Text>
                  </View>
                </Pressable>

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
