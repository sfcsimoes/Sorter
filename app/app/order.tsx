import { CameraView, useCameraPermissions } from "expo-camera/next";
import { useState } from "react";
import { StyleSheet, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text, View, Button } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import React from "react";
import Toast from "react-native-toast-message";
import StyledButton from "@/components/StyledButtont";

export interface Weather {
  id: number;
  store: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  productsInShipmentOrders?: ProductsInShipmentOrdersEntity[] | null;
}
export interface ProductsInShipmentOrdersEntity {
  products?: Products | null;
  shipmentOrder: number;
  units: number;
  isInTransportationBox: boolean;
  transportationBox?: boolean | null | undefined;
  product?: number | null;
}
export interface Products {
  id: number;
  name: string;
  sku: string;
  ian: string;
  isTransportationBox: boolean;
  createdAt: string;
  updatedAt: string;
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function List(props: {
  orders: ProductsInShipmentOrdersEntity[];
  readings: String[];
}) {
  const [showItems, setShowItems] = useState(false);
  const colorScheme = useColorScheme();

  function handleClick() {
    setShowItems(!showItems);
  }

  type AuxParameters = {
    isBox: boolean | null | undefined;
    showItems: boolean;
    handleClick: any;
  };

  function Aux({ isBox, showItems, handleClick }: AuxParameters) {
    if (!isBox) {
      return (
        <>
          <View>
            <StyledButton
              onPress={undefined}
              title={undefined}
              variant="default"
              icon={<FontAwesome name="pencil" size={20} />}
            />
          </View>
          <View style={{ marginLeft: 8 }}>
            <StyledButton
              onPress={undefined}
              title={undefined}
              variant="default"
              icon={<FontAwesome name="plus" size={20} />}
            />
          </View>
        </>
      );
    }
    if (showItems) {
      return (
        <>
          <StyledButton
            onPress={handleClick}
            title={undefined}
            variant="default"
            icon={<FontAwesome name="chevron-down" size={20} />}
          />
        </>
      );
    } else {
      return (
        <>
          <StyledButton
            onPress={handleClick}
            title={undefined}
            variant="default"
            icon={<FontAwesome name="chevron-up" size={20} />}
          />
        </>
      );
    }
  }

  return (
    <>
      <FlashList
        nestedScrollEnabled={true}
        data={props.orders}
        renderItem={({ item, index }) => {
          return (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <View style={{ marginLeft: 2, flex: 4 }}>
                  <Text style={styles.title}>{item.products?.name}</Text>
                  <Text style={styles.subTitle}>
                    Quantidade:{" "}
                    {
                      props.readings.filter((i) => i == item.products?.ian)
                        .length
                    }{" "}
                    / {item.units}
                  </Text>
                  <Text style={styles.subTitle}>EAN: {item.products?.ian}</Text>
                </View>
                <View style={{ marginLeft: 2, flex: 2, flexDirection: "row" }}>
                  <Aux
                    isBox={item.transportationBox}
                    showItems={showItems}
                    handleClick={handleClick}
                  />
                </View>
              </View>
              <View
                style={styles.separator}
                lightColor="#eee"
                darkColor="rgba(255,255,255,0.15)"
              />

              {/* {showItems ? (
                <>
                  <FlashList
                    nestedScrollEnabled={true}
                    data={item.items}
                    renderItem={({ item, index }) => {
                      return (
                        <>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginTop: 2,
                              marginLeft: 18,
                            }}
                            // className="flex-row items-center mt-2 ms-6"
                          >
                            <View
                              //   className="ms-1"
                              style={{ marginLeft: 2, flex: 4 }}
                            >
                              <Text style={styles.title}>{item.name}</Text>
                              <Text
                                style={styles.subTitle}
                                // className="text-muted-foreground"
                              >
                                Quantidade: {item.units}
                              </Text>
                              <Text
                                style={styles.subTitle}
                                // className="text-muted-foreground"
                              >
                                EAN: {item.ian}
                              </Text>
                            </View>
                            <View
                              //   className="ms-auto flex-row"
                              style={{
                                marginLeft: 2,
                                flex: 2,
                                flexDirection: "row",
                              }}
                            >
                              <Aux
                                isBox={false}
                                showItems={showItems}
                                handleClick={handleClick}
                              />
                            </View>
                          </View>

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
                </>
              ) : (
                <View></View>
              )} */}
            </>
          );
        }}
        estimatedItemSize={200}
      />
    </>
  );
}

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [orders, setOrders] = React.useState<ProductsInShipmentOrdersEntity[]>(
    []
  );
  const [hasScanned, setHasScanned] = React.useState(false);
  const [readings, setReadings] = React.useState<String[]>([]);

  React.useEffect(() => {
    fetch(process.env.EXPO_PUBLIC_API_URL + "/shipmentOrders/2")
      .then((resp) => resp.json())
      .then((json) => setOrders(json.productsInShipmentOrders))
      .catch((error) => console.error(error));
    // .finally(() => setLoading(false));
  });

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Pressable onPress={requestPermission}>
          <Text>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  const handleBarCodeScanned = (props: { type: any; data: any }) => {
    const ian = JSON.parse(props.data).ian;
    var order = orders.find((i) => i.products?.ian == ian);
    setHasScanned(true);

    if (
      order?.units &&
      readings.filter((i) => i == ian).length >= order?.units
    ) {
      Toast.show({
        type: "error",
        text1: "Todos produtos ja foram lidos",
        visibilityTime: 2500,
      });
    } else {
      setReadings((readings) => [...readings, ian]);
      Toast.show({
        type: "success",
        text1: "Leitura Realizada com Sucesso",
        visibilityTime: 2500,
      });
    }

    setTimeout(() => {
      setHasScanned(false);
    }, 1500);
  };

  // interface Order {
  //   name: string;
  //   date: number;
  //   ian: string;
  //   units: string;
  //   isBox: Boolean;
  // }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={hasScanned ? undefined : handleBarCodeScanned}
      >
        <Text></Text>
      </CameraView>
      <View style={styles.container}>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.heading} role="heading" aria-level="2">
            Artigos
          </Text>
          <View
            style={styles.separator}
            lightColor="#eee"
            darkColor="rgba(255,255,255,0.15)"
          />
        </View>
        <List orders={orders} readings={readings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    margin: "2%",
  },
  camera: {
    flex: 1,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  list: {
    flex: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 15,
  },
  subTitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: "95%",
  },
});