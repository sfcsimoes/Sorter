import React, { useState, useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MonoText } from "@/components/StyledText";
import { Appearance } from "react-native";
import { useSession } from "@/auth/ctx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/components/useColorScheme";
import { Picker } from "@react-native-picker/picker";
import { DatabaseHelper } from "@/db/database";
import { Warehouse } from "@/types/types";

function WarehousePicket(props: { iconColor: string }) {
  const pickerRef = useRef<any>();
  const [warehouseId, setWarehouseId] = React.useState<string>("-1");
  const [localWarehouses, setLocalWarehouses] = React.useState<
    Warehouse[]
  >([]);
  const [warehouse, setWarehouse] = React.useState<string>("");

  let dropDownIconColor =
    Appearance.getColorScheme() === "dark" ? "#000" : "#fff";

  function open() {
    if (pickerRef.current) {
      pickerRef.current.focus();
    }
  }

  function close() {
    pickerRef.current.blur();
  }

  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem("warehouseId", value);
      setWarehouseId(value);
    } catch (e) {
      // saving error
    }
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("warehouseId");
      if (value !== null) {
        setWarehouseId(value);
      }
    } catch (e) {
      // error reading value
    }
  };

  React.useMemo(() => {
    async function setup() {
      var db = new DatabaseHelper();
      const result = await db.getWarehouses();
      setLocalWarehouses(result);
      db.syncWarehouses();
    }
    setup();
  }, []);

  React.useEffect(() => {
    var warehouseName = localWarehouses.find(
      (i) => i.id.toString() == warehouseId
    )?.name;
    setWarehouse(warehouseName || "");
  }, [warehouseId]);

  React.useMemo(() => {
    getData();
  }, []);

  return (
    <TouchableOpacity
      onPress={() => {
        // handle onPress
        open();
      }}
      style={styles.row}
    >
      <View style={[styles.rowIcon]}>
        <FontAwesome color={props.iconColor} name="home" size={20} />
      </View>

      <MonoText style={styles.rowLabel}>Armazem</MonoText>

      <View style={styles.rowSpacer} />

      <Text style={[styles.rowValue, { width: 180 }]} numberOfLines={1}>
        {warehouse}
      </Text>

      <FontAwesome color="#C6C6C6" name="chevron-right" size={20} />
      <Picker
        ref={pickerRef}
        selectedValue={warehouseId}
        dropdownIconColor={dropDownIconColor}
        onValueChange={(itemValue, itemIndex) => {
          if (itemValue) storeData(itemValue.toString());
        }}
      >
        <Picker.Item label="Options" />
        {localWarehouses.map(function (data) {
          return (
            <Picker.Item
              key={data.id}
              value={data.id}
              label={data.name || ""}
            />
          );
        })}
      </Picker>
    </TouchableOpacity>
  );
}

export default function Modal() {
  const colorScheme = useColorScheme();
  const { signOut } = useSession();
  const [form, setForm] = useState({
    darkMode: Appearance.getColorScheme() === "dark",
    emailNotifications: true,
    pushNotifications: false,
  });
  let isDarkMode = Appearance.getColorScheme() === "dark";
  let iconColor = isDarkMode ? "#fff" : "#000";

  function editTheme(darkMode: boolean) {
    if (darkMode) {
      Appearance.setColorScheme("dark");
    } else {
      Appearance.setColorScheme("light");
    }
    setForm({ ...form, darkMode });
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MonoText style={styles.title}>Settings</MonoText>

          {/* <Text style={styles.subtitle}>
            Lorem ipsum dolor sit amet consectetur.
          </Text> */}
        </View>

        <ScrollView>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferencias</Text>

            <View style={styles.sectionBody}>
              {/* <View style={[styles.rowWrapper, styles.rowFirst]}>
                <TouchableOpacity
                  onPress={() => {
                    // handle onPress
                  }}
                  style={styles.row}
                >
                  <View style={[styles.rowIcon]}>
                    <FontAwesome color="#fff" name="globe" size={20} />
                  </View>

                  <MonoText style={styles.rowLabel}>Language</MonoText>

                  <View style={styles.rowSpacer} />

                  <Text style={styles.rowValue}>English</Text>

                  <FontAwesome color="#C6C6C6" name="chevron-right" size={20} />
                </TouchableOpacity>
              </View> */}

              <View style={[styles.rowWrapper, styles.rowFirst]}>
                <View style={styles.row}>
                  <View style={[styles.rowIcon]}>
                    <FontAwesome color={iconColor} name="moon-o" size={20} />
                  </View>

                  <MonoText style={styles.rowLabel}>Modo Escuro</MonoText>

                  <View style={styles.rowSpacer} />

                  <Switch
                    trackColor={{ false: "#ccc", true: "#ccc" }}
                    thumbColor={isDarkMode ? "#fff" : "#fff"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(darkMode) => editTheme(darkMode)}
                    value={form.darkMode}
                  />
                </View>
              </View>

              <View style={styles.rowWrapper}>
                <WarehousePicket iconColor={iconColor}></WarehousePicket>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notificações</Text>

              <View style={styles.sectionBody}>
                <View style={[styles.rowWrapper, styles.rowFirst]}>
                  <View style={styles.row}>
                    <View style={[styles.rowIcon]}>
                      <FontAwesome color={iconColor} name="bell" size={20} />
                    </View>

                    <MonoText style={styles.rowLabel}>
                      Notificações Push
                    </MonoText>

                    <View style={styles.rowSpacer} />

                    <Switch
                      trackColor={{ false: "#ccc", true: "#ccc" }}
                      thumbColor={isDarkMode ? "#fff" : "#fff"}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={(pushNotifications) =>
                        setForm({ ...form, pushNotifications })
                      }
                      value={form.pushNotifications}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Secção</Text>

              <View style={styles.sectionBody}>
                <View style={[styles.rowWrapper, styles.rowFirst]}>
                  <View style={styles.row}>
                    <TouchableOpacity
                      onPress={() => {
                        // handle onPress
                        signOut();
                      }}
                      style={styles.row}
                    >
                      <View style={[styles.rowIcon]}>
                        <FontAwesome
                          color={iconColor}
                          name="sign-out"
                          size={20}
                        />
                      </View>

                      <MonoText style={styles.rowLabel}>Logout</MonoText>

                      <View style={styles.rowSpacer} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  header: {
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#929292",
  },
  contentFooter: {
    marginTop: 24,
    fontSize: 13,
    fontWeight: "500",
    color: "#929292",
    textAlign: "center",
  },
  /** Section */
  section: {
    paddingTop: 12,
  },
  sectionTitle: {
    marginVertical: 8,
    marginHorizontal: 24,
    fontSize: 14,
    fontWeight: "600",
    color: "#a7a7a7",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  sectionBody: {
    paddingLeft: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e3e3e3",
  },
  /** Row */
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingRight: 16,
    height: 50,
  },
  rowWrapper: {
    borderTopWidth: 1,
    borderColor: "#e3e3e3",
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "500",
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  rowValue: {
    fontSize: 17,
    fontWeight: "500",
    color: "#8B8B8B",
    marginRight: 4,
  },
});