import { CameraView, useCameraPermissions } from "expo-camera/next";
import { useState } from "react";
import { StyleSheet, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text, View, Button } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useColorScheme } from "@/components/useColorScheme";
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
  ean: string;
  isTransportationBox: boolean;
  createdAt: string;
  updatedAt: string;
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
                      props.readings.filter((i) => i == item.products?.ean)
                        .length
                    }{" "}
                    / {item.units}
                  </Text>
                  <Text style={styles.subTitle}>EAN: {item.products?.ean}</Text>
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

function test() {
  // return '';
  console.log("teste");
}

function ShowCompleteButton(props: { show: Boolean }) {
  if (props.show) {
    return <StyledButton onPress={test} title="Finalizar" variant="default" />;
  }
}

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [orders, setOrders] = React.useState<ProductsInShipmentOrdersEntity[]>([]);
  const [hasScanned, setHasScanned] = React.useState(false);
  const [readings, setReadings] = React.useState<String[]>([]);

  const totalOrderUnits = React.useMemo(
    () =>
      orders.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.units;
      }, 0),
    [orders]
  );
  const readAll = React.useMemo(
    () => readings.length == totalOrderUnits,
    [readings, totalOrderUnits]
  );

  React.useEffect(() => {
    fetch(process.env.EXPO_PUBLIC_API_URL + "/shipmentOrder/2")
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
    let ean = "";
    switch (props.type) {
      case 256:
        ean = JSON.parse(props.data).ean;
        break;
      case 32:
        ean = props.data.slice(0, props.data.length - 1);
        break;
    }

    if (ean == "") {
      Toast.show({
        type: "error",
        text1: "Falha ao de leitura",
        visibilityTime: 1750,
      });
      return;
    }

    var order = orders.find((i) => i.products?.ean == ean);

    if (order == null || order == undefined) {
      Toast.show({
        type: "error",
        text1: "Artigo nao esta no pedido",
        visibilityTime: 1750,
      });
      return;
    }
    setHasScanned(true);

    if (
      order?.units &&
      readings.filter((i) => i == ean).length >= order?.units
    ) {
      Toast.show({
        type: "error",
        text1: "Todos artigos ja foram lidos",
        visibilityTime: 1750,
      });
    } else {
      setReadings((readings) => [...readings, ean]);
      Toast.show({
        type: "success",
        text1: "Leitura Realizada com Sucesso",
        visibilityTime: 1750,
      });
    }

    setTimeout(() => {
      setHasScanned(false);
    }, 1500);
  };

  const removeItem  = (props: { type: any; data: any }) => {
    
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13"] }}
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
        <ShowCompleteButton show={readAll} />
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
