import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { StyleSheet, Pressable, Vibration } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text, View, TextInput } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import Toast from "react-native-toast-message";
import StyledButton from "@/components/StyledButton";
import Separator from "@/components/Separator";
import {
  AuxParameters,
  ProductsInBoxes,
  ProductsInShipmentOrder,
  ShipmentOrder,
} from "@/types/types";
import {
  Stack,
  useLocalSearchParams,
  router,
  useNavigation,
} from "expo-router";
import { atom, useAtom } from "jotai";
import { DatabaseHelper } from "@/db/database";
import { DangerAlert } from "@/components/DangerAlert";
import { useSession } from "@/auth/ctx";

const productsAtom = atom<ProductsInShipmentOrder[]>([]);
const shipmentOrderAtom = atom<ShipmentOrder>({
  id: 0,
  originId: 0,
  destinationId: 0,
  statusId: 0,
  createdAt: "",
  updatedAt: "",
  synchronizationId: "",
  fulfilledById: 0,
  productsInShipmentOrders: [],
  productsInBoxes: [],
});
const readingsAtom = atom<string[]>([]);
const boxesAtom = atom<ProductsInBoxes[]>([]);
const haveBoxesAtom = atom<boolean>(false);

function Options({ isBox, showItems, handleClick, item }: AuxParameters) {
  const [readings, setReadings] = useAtom(readingsAtom);
  const [products, setProducts] = useAtom(productsAtom);
  const [boxes, setBoxes] = useAtom(boxesAtom);
  const [haveBoxes, setHaveBoxes] = useAtom(haveBoxesAtom);

  function AddToBox(props: { item: ProductsInShipmentOrder }) {
    if (haveBoxes)
      return (
        <StyledButton
          onPress={() => {
            if (props.item.isInTransportationBox) {
              props.item.isInTransportationBox = false;
              props.item.transportationBoxId = 0;
            } else {
              props.item.isInTransportationBox = true;
              props.item.transportationBoxId = boxes[0].transportationBoxId;
            }
            setProducts((p) => [...p]);
          }}
          title={undefined}
          variant="default"
          icon={
            props.item.isInTransportationBox ? (
              <FontAwesome name="remove" size={18} />
            ) : (
              <FontAwesome name="shopping-basket" size={18} />
            )
          }
        />
      );
  }

  if (!isBox && item) {
    let product = products.find(
      (i: any) => i.product?.ean == item.product?.ean
    );
    return (
      <>
        <View>
          <StyledButton
            onPress={() => {
              var index = readings.findIndex((i) => i == item.product?.ean);
              if (index > -1) {
                Vibration.vibrate(15);
                let copy = [...readings];
                copy.splice(index, 1);
                setReadings(copy);
              }
            }}
            title={undefined}
            variant="default"
            icon={<FontAwesome name="minus" size={18} />}
          />
        </View>

        <View style={{ marginLeft: 8 }}>
          <StyledButton
            onPress={() => {
              if (
                item?.units &&
                readings.filter((i) => i == item.product?.ean).length >=
                  item?.units
              ) {
                Toast.show({
                  type: "error",
                  text1: "Todos artigos ja foram lidos",
                  visibilityTime: 1750,
                });
              } else {
                if (item.product?.ean) {
                  setReadings([...readings, item.product?.ean]);
                  Vibration.vibrate(15);
                }
              }
            }}
            title={undefined}
            variant="default"
            icon={<FontAwesome name="plus" size={18} />}
          />
        </View>

        <View style={{ marginLeft: 8 }}>
          <AddToBox item={item} />
        </View>
      </>
    );
  } else {
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
}

function List() {
  const [products, setProducts] = useAtom(productsAtom);
  const [readings, setReadings] = useAtom(readingsAtom);
  const [boxes, setBoxes] = useAtom(boxesAtom);
  const [haveBoxes, setHaveBoxes] = useAtom(haveBoxesAtom);
  const [showItems, setShowItems] = useState(true);

  function handleClick() {
    setShowItems(!showItems);
  }

  setHaveBoxes(
    React.useMemo(() => {
      return (
        products.filter((i) => i.isInTransportationBox == true).length > 0 ||
        boxes.length > 0
      );
    }, [products, boxes])
  );

  const notInBoxes = React.useMemo(() => {
    return products.filter((i) => i.isInTransportationBox == false);
  }, [products, readings, showItems]);

  const InBoxes = React.useMemo(() => {
    var boxesHolder: ProductsInBoxes[] = [];
    products.forEach((element) => {
      if (element.isInTransportationBox) {
        let find = boxesHolder.find(
          (i) => i.transportationBoxId == element.transportationBoxId
        );
        if (find) {
          find.products.push(element);
        } else {
          boxesHolder.push({
            transportationBoxId: element.transportationBoxId,
            products: [element],
          });
        }
      }
    });
    return boxesHolder;
  }, [products, readings, boxes, showItems]);

  return (
    <>
      <View style={{ flex: 1 }}>
        {notInBoxes.length > 0 ? (
          <>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.heading} role="heading" aria-level="2">
                Artigos
              </Text>
              <Separator />
            </View>
            <FlashList
              data={notInBoxes}
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
                      <View style={{ marginLeft: 2, flex: 6 }}>
                        <Text style={styles.title}>{item.product?.name}</Text>
                        <Text style={styles.subTitle}>
                          Quantidade:{" "}
                          {
                            readings.filter((i) => i == item.product?.ean)
                              .length
                          }{" "}
                          / {item.units}
                        </Text>
                        <Text style={styles.subTitle}>
                          EAN: {item.product?.ean}
                        </Text>
                      </View>
                      <View
                        style={{ marginLeft: 2, flex: 4, flexDirection: "row" }}
                      >
                        <Options
                          isBox={item.isInTransportationBox}
                          showItems={showItems}
                          handleClick={handleClick}
                          item={item}
                        />
                      </View>
                    </View>
                    <Separator />
                  </>
                );
              }}
              estimatedItemSize={200}
            />
          </>
        ) : (
          <View></View>
        )}

        {InBoxes.length > 0 ? (
          <>
            <View style={{ flex: 1 }}>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.heading} role="heading" aria-level="2">
                  Artigos em Caixas
                </Text>
                <Separator />
              </View>
              <FlashList
                nestedScrollEnabled={true}
                data={InBoxes}
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
                          <Text style={styles.title}>
                            Caixa {item.transportationBoxId}
                          </Text>
                        </View>
                        <View
                          style={{
                            marginLeft: 2,
                            flex: 2,
                            flexDirection: "row",
                          }}
                        >
                          <Options
                            isBox={true}
                            showItems={showItems}
                            handleClick={handleClick}
                            item={null}
                          />
                        </View>
                      </View>
                      <Separator />
                      {showItems ? (
                        <>
                          <View style={{ minHeight: 100 }}>
                            <FlashList
                              nestedScrollEnabled={true}
                              data={item.products}
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
                                    >
                                      <View style={{ marginLeft: 2, flex: 6 }}>
                                        <Text style={styles.title}>
                                          {item.product.name}
                                        </Text>
                                        <Text style={styles.subTitle}>
                                          Quantidade:{" "}
                                          {
                                            readings.filter(
                                              (i) => i == item.product?.ean
                                            ).length
                                          }{" "}
                                          / {item.units}
                                        </Text>
                                        <Text style={styles.subTitle}>
                                          EAN: {item.product.ean}
                                        </Text>
                                      </View>
                                      <View
                                        style={{
                                          marginLeft: 2,
                                          flex: 4,
                                          flexDirection: "row",
                                        }}
                                      >
                                        <Options
                                          isBox={false}
                                          showItems={showItems}
                                          handleClick={handleClick}
                                          item={item}
                                        />
                                      </View>
                                    </View>

                                    <Separator />
                                  </>
                                );
                              }}
                              estimatedItemSize={200}
                            />
                          </View>
                        </>
                      ) : (
                        <View></View>
                      )}
                    </>
                  );
                }}
                estimatedItemSize={200}
              />
            </View>
          </>
        ) : (
          <View></View>
        )}
      </View>
    </>
  );
}

function ShowCompleteButton(props: { show: Boolean }) {
  const [products, setProducts] = useAtom(productsAtom);
  const [shipmentOrder, setShipmentOrder] = useAtom(shipmentOrderAtom);
  const { session, isLoading } = useSession();

  async function finishOrder() {
    if (session) {
      let db = new DatabaseHelper();
      let userId = JSON.parse(session).id;
      shipmentOrder.statusId = 2;
      shipmentOrder.productsInShipmentOrders = products;
      shipmentOrder.fulfilledById = parseInt(userId);
      // products.forEach((i) => (i.fulfilledById = userId));
      db.updateShipmentOrders(shipmentOrder);
      router.back();
    }
  }

  if (props.show) {
    return (
      <StyledButton onPress={finishOrder} title="Finalizar" variant="default" />
    );
  }
}

function FulfilledOrder(props: { productsList: ProductsInShipmentOrder[] }) {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Encomenda ",
        }}
      />

      <Text style={styles.heading} role="heading" aria-level="2">
        Status: {" Fulfilled"}
      </Text>
      <Separator />
      <Text style={styles.heading} role="heading" aria-level="2">
        Fulfilled By: {" Fulfilled"}
      </Text>
      <Separator />
      <View style={{ marginTop: 8 }}>
        <Text style={styles.heading} role="heading" aria-level="2">
          Artigos
        </Text>
        <Separator />
      </View>
      <FlashList
        data={props.productsList}
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
                <View style={{ marginLeft: 2, flex: 6 }}>
                  <Text style={styles.title}>{item.product?.name}</Text>
                  <Text style={styles.subTitle}>Quantidade:{item.units}</Text>
                  <Text style={styles.subTitle}>EAN: {item.product?.ean}</Text>
                </View>
                <View
                  style={{ marginLeft: 2, flex: 4, flexDirection: "row" }}
                ></View>
              </View>
              <Separator />
            </>
          );
        }}
        estimatedItemSize={200}
      />
    </View>
  );
}

export default function App() {
  const params = useLocalSearchParams();
  const { id } = params;
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = React.useState(false);
  const [products, setProducts] = useAtom(productsAtom);
  const [readings, setReadings] = useAtom(readingsAtom);
  const [shipmentOrder, setShipmentOrder] = useAtom(shipmentOrderAtom);
  const [boxes, setBoxes] = useAtom(boxesAtom);

  const totalOrderUnits = React.useMemo(
    () =>
      products.reduce((accumulator: any, currentValue: any) => {
        return accumulator + currentValue.units;
      }, 0),
    [products]
  );

  const readAll = React.useMemo(
    () => readings.length == totalOrderUnits,
    [readings, totalOrderUnits]
  );

  // Navigation
  const navigation = useNavigation();

  // Effect
  React.useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      // Do your stuff here
      setReadings([]);
      setBoxes([]);
      navigation.dispatch(e.data.action);
    });
  }, []);

  React.useEffect(() => {
    async function setup() {
      let db = new DatabaseHelper();
      if (id) {
        let shipmentOrder = await db.getShipmentOrder(parseInt(id.toString()));
        setShipmentOrder(shipmentOrder);

        let products = await db.getShipmentOrdersProducts(
          parseInt(id.toString())
        );
        setProducts(products);

        products
          .filter((i: any) => i.isInTransportationBox == true)
          .forEach((z: any) => {
            if (
              !boxes.find((i) => i.transportationBoxId == z.transportationBoxId)
            ) {
              setBoxes([
                { products: [], transportationBoxId: z.transportationBoxId },
              ]);
            }
          });
      }
    }
    setup();
  }, []);

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
    let isBox = false;
    let id = 0;
    switch (props.type) {
      case 256:
        var json = JSON.parse(props.data);
        ean = json.ean;
        if (json.isBox) {
          isBox = json.isBox;
          id = json.id;
        }
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

    if (isBox) {
      var find = boxes.find((i) => i.transportationBoxId == id);
      if (!find) {
        setBoxes([{ products: [], transportationBoxId: id }]);
      }
      return;
    }

    var product = products.find((i: any) => i.product?.ean == ean);

    setHasScanned(true);

    if (product == null || product == undefined) {
      Toast.show({
        type: "error",
        text1: "Artigo nao esta no pedido",
        visibilityTime: 1750,
      });
      return;
    }

    if (
      product?.units &&
      readings.filter((i) => i == ean).length >= product?.units
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

  if (shipmentOrder.statusId == 2) {
    console.log(products);
    return <FulfilledOrder productsList={products} />;
  }
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Encomenda " + id,
        }}
      />
      <DangerAlert body="Sem ligação ao sorter." />

      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13"] }}
        onBarcodeScanned={hasScanned ? undefined : handleBarCodeScanned}
      >
        <Text></Text>
      </CameraView>
      <View style={styles.container}>
        <List />
        <ShowCompleteButton show={readAll} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    justifyContent: "center",
    padding: "2%",
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
  }
});
