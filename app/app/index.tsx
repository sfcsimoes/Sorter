import React from "react";
import { StyleSheet, Pressable, Dimensions } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View, TextInput } from "@/components/Themed";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
// import { drizzle } from "drizzle-orm/expo-sqlite";
// import { openDatabaseSync } from "expo-sqlite/next";
import * as schema from "@/db/schema";
import { DatabaseHelper } from "@/db/database";
// import { eq } from "drizzle-orm";

// const expo = openDatabaseSync("db.db");
// const db = drizzle(expo, { schema });

export default function TabOneScreen() {
  interface Warehouse {
    id: number;
    name: string;
    address: any;
    createdAt: string;
    updatedAt: string;
  }

  const [text, onChangeText] = React.useState("Useless Text");
  const [number, onChangeNumber] = React.useState("");
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [localWarehouses, setLocalWarehouses] = React.useState<
    schema.Warehouse[]
  >([]);

  React.useEffect(() => {
    async function setup() {
      var db = new DatabaseHelper();
      const result = await db.getWarehouses();
      setLocalWarehouses(result);
      db.syncWarehouses();
      // setLocalWarehouses(result);
      // db.dropDatabase();
    }
    setup();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <FontAwesome name="home" size={24} />
        Armazens
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
                <Link
                  href={{
                    pathname: "/orders",
                    params: { id: item.id },
                    // params: { warehouseName: item.name  },
                  }}
                  asChild
                >
                  <Pressable style={styles.list}>
                    <View style={{ flex: 4 }}>
                      <Text style={styles.title}>{item.name}</Text>
                      <Text style={styles.subTitle}>{item.address}</Text>
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
