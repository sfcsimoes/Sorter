import { CameraView, useCameraPermissions } from "expo-camera";
import { StyleSheet, Pressable, Vibration, Appearance } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text, View } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import Toast from "react-native-toast-message";
import StyledButton from "@/components/StyledButton";
import Separator from "@/components/Separator";
import {
  AuxParameters,
  OrderStatusEnum,
  ProductsInBoxes,
  ProductsInShipmentOrder,
  ShipmentOrder,
  ShowBoxItem,
  Warehouse,
} from "@/types/types";
import {
  Stack,
  useLocalSearchParams,
  router,
  useNavigation,
} from "expo-router";
import { atom, useAtom } from "jotai";
import { DatabaseHelper } from "@/db/database";
import { ConnectionAlert } from "@/components/ConnectionAlert";
import { useSession } from "@/auth/ctx";
import { Picker } from "@react-native-picker/picker";

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
const showBoxesItemsAtom = atom<ShowBoxItem[]>([]);
const warehousesAtom = atom<Warehouse[]>([]);

function Options({ isBox, transportationBoxId, item }: AuxParameters) {
  const [readings, setReadings] = useAtom(readingsAtom);
  const [products, setProducts] = useAtom(productsAtom);
  const [boxes] = useAtom(boxesAtom);
  const [haveBoxes] = useAtom(haveBoxesAtom);
  const [test] = React.useState();
  const [showBoxesItems, setShowBoxesItems] = useAtom(showBoxesItemsAtom);

  function AddToBox(props: { item: ProductsInShipmentOrder }) {
    const pickerRef = React.useRef<any>();

    function open() {
      if (pickerRef.current) {
        pickerRef.current.focus();
      }
    }

    function close() {
      pickerRef.current.blur();
    }

    let dropDownIconColor =
      Appearance.getColorScheme() === "dark" ? "#000" : "#fff";
    if (haveBoxes)
      return (
        <View>
          {showBoxesItems.length > 1 ? (
            <View>
              <Picker
                style={{ display: "none" }}
                ref={pickerRef}
                selectedValue={test}
                dropdownIconColor={dropDownIconColor}
                onValueChange={(itemValue: any, itemIndex) => {
                  if (itemValue) {
                    props.item.isInTransportationBox = true;
                    props.item.transportationBoxId = itemValue;
                    setProducts((p) => [...p]);
                  }
                }}
              >
                <Picker.Item label="Boxes" />
                {showBoxesItems.map(function (box) {
                  return (
                    <Picker.Item
                      key={box.transportationBoxId}
                      value={box.transportationBoxId}
                      label={"Box " + box.transportationBoxId || ""}
                    />
                  );
                })}
              </Picker>
              <StyledButton
                onPress={() => {
                  if (props.item.isInTransportationBox) {
                    props.item.isInTransportationBox = false;
                    props.item.transportationBoxId = 0;
                    setProducts((p) => [...p]);
                  } else {
                    open();
                  }
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
            </View>
          ) : (
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
          )}
        </View>
      );
  }

  if (!isBox && item) {
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
    let showBox = showBoxesItems.find(
      (i) => i.transportationBoxId == transportationBoxId
    );
    if (showBox?.show && showBox.show) {
      return (
        <>
          <StyledButton
            onPress={() => {
              if (showBox) {
                setShowBoxesItems((options) =>
                  options.map((option) =>
                    option.transportationBoxId === transportationBoxId
                      ? { ...option, show: false }
                      : option
                  )
                );
              }
            }}
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
            onPress={() => {
              if (showBox) {
                setShowBoxesItems((options) =>
                  options.map((option) =>
                    option.transportationBoxId === transportationBoxId
                      ? { ...option, show: true }
                      : option
                  )
                );
              }
            }}
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
  const [products] = useAtom(productsAtom);
  const [readings] = useAtom(readingsAtom);
  const [boxes] = useAtom(boxesAtom);
  const [haveBoxes, setHaveBoxes] = useAtom(haveBoxesAtom);
  const [showBoxesItems, setShowBoxesItems] = useAtom(showBoxesItemsAtom);

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
  }, [products, readings]);

  const InBoxes = React.useMemo(() => {
    let boxesHolder: ProductsInBoxes[] = [];
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
    boxes.forEach((box) => {
      let find = boxesHolder.find(
        (i) => i.transportationBoxId == box.transportationBoxId
      );
      if (!find) {
        boxesHolder.unshift(box);
      }
    });

    return boxesHolder;
  }, [products, readings, boxes, showBoxesItems]);

  React.useEffect(() => {
    var showBoxes: ShowBoxItem[] = [];
    products.forEach((element) => {
      if (element.isInTransportationBox) {
        let find = showBoxes.find(
          (i) => i.transportationBoxId == element.transportationBoxId
        );
        if (!find) {
          showBoxes.push({
            transportationBoxId: element.transportationBoxId,
            show: true,
          });
        }
      }
    });
    boxes.forEach((box) => {
      let find = showBoxes.find(
        (i) => i.transportationBoxId == box.transportationBoxId
      );
      if (!find) {
        showBoxes.push({
          transportationBoxId: box.transportationBoxId,
          show: false,
        });
      }
    });
    setShowBoxesItems(showBoxes);
  }, [products, readings, boxes]);

  return (
    <>
      <View style={{ flex: 1 }}>
        {notInBoxes.length > 0 ? (
          <>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.heading} role="heading" aria-level="2">
                Products
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
                          Quantity:{" "}
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
                          isBox={false}
                          transportationBoxId={item.transportationBoxId}
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
                  Products in Boxes
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
                            Box {item.transportationBoxId}
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
                            transportationBoxId={item.transportationBoxId}
                            item={null}
                          />
                        </View>
                      </View>
                      <Separator />
                      {showBoxesItems.find(
                        (i) => i.transportationBoxId == item.transportationBoxId
                      )?.show && item.products.length > 0 ? (
                        <View style={{ minHeight: 25 }}>
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
                                        Quantity:{" "}
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
                                        transportationBoxId={
                                          item.transportationBoxId
                                        }
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
  const [products] = useAtom(productsAtom);
  const [shipmentOrder] = useAtom(shipmentOrderAtom);
  const { session, isLoading } = useSession();

  async function finishOrder() {
    if (session) {
      let db = new DatabaseHelper();
      let userId = JSON.parse(session).id;
      shipmentOrder.statusId = 2;
      shipmentOrder.productsInShipmentOrders = products;
      shipmentOrder.fulfilledById = parseInt(userId);
      db.updateLocalShipmentOrders(shipmentOrder);
      router.back();
    }
  }

  if (props.show) {
    return (
      <StyledButton onPress={finishOrder} title="Finish" variant="default" />
    );
  }
}

function FulfilledOrder(props: {
  shipmentOrder: ShipmentOrder;
  productsList: ProductsInShipmentOrder[];
}) {
  const [warehouses, setWarehouses] = useAtom(warehousesAtom);

  const notInBoxes = React.useMemo(() => {
    return props.productsList.filter((i) => i.isInTransportationBox == false);
  }, [props.productsList]);

  const InBoxes = React.useMemo(() => {
    let boxesHolder: ProductsInBoxes[] = [];
    props.productsList.forEach((element) => {
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
  }, [props.productsList]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Order " + props.shipmentOrder.id,
        }}
      />
      <ConnectionAlert body="No connection to the sorter." />
      <Text style={styles.sub_heading} role="heading" aria-level="2">
        Origin:{" "}
        {
          warehouses.find(
            (warehouse) => warehouse.id == props.shipmentOrder.originId
          )?.name
        }
      </Text>
      <Separator />
      <Text style={styles.sub_heading} role="heading" aria-level="2">
        Destination:{" "}
        {
          warehouses.find(
            (warehouse) => warehouse.id == props.shipmentOrder.destinationId
          )?.name
        }
      </Text>
      <Separator />
      <Text style={styles.sub_heading} role="heading" aria-level="2">
        Status: {OrderStatusEnum[props.shipmentOrder.statusId]}
      </Text>
      <Separator />
      <Text style={styles.sub_heading} role="heading" aria-level="2">
        Fulfilled By: {props.shipmentOrder.fulfilledBy?.name}
      </Text>
      <Separator />
      {notInBoxes.length > 0 ? (
        <>
          <View style={{ marginTop: 8 }}>
            <Text style={styles.heading} role="heading" aria-level="2">
              Products
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
                        Quantity: {item.units}
                      </Text>
                      <Text style={styles.subTitle}>
                        EAN: {item.product?.ean}
                      </Text>
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
        </>
      ) : (
        <View></View>
      )}

      {InBoxes.length > 0 ? (
        <>
          <View style={{ marginTop: 8 }}>
            <Text style={styles.heading} role="heading" aria-level="2">
              Products in Boxes
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
                        Box {item.transportationBoxId}
                      </Text>
                    </View>
                  </View>
                  <Separator />
                  {item.products.length > 0 ? (
                    <View style={{ minHeight: 25 }}>
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
                                    Quantity: {item.units}
                                  </Text>
                                  <Text style={styles.subTitle}>
                                    EAN: {item.product.ean}
                                  </Text>
                                </View>
                              </View>

                              <Separator />
                            </>
                          );
                        }}
                        estimatedItemSize={200}
                      />
                    </View>
                  ) : (
                    <View></View>
                  )}
                </>
              );
            }}
            estimatedItemSize={200}
          />
        </>
      ) : (
        <View></View>
      )}
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
  const [warehouses, setWarehouses] = useAtom(warehousesAtom);

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
        let shipmentOrder = await db.getShipmentOrderById(
          parseInt(id.toString())
        );
        setShipmentOrder(shipmentOrder);

        let products = await db.getShipmentOrdersProducts(
          parseInt(id.toString())
        );
        setProducts(products);

        setWarehouses(await db.getWarehouses());

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

  React.useEffect(() => {
    if (hasScanned) {
      setTimeout(() => {
        setHasScanned(false);
      }, 1500);
    }
  }, [hasScanned]);

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
      setHasScanned(true);
      if (!find) {
        var copy = [...boxes];
        copy.unshift({ transportationBoxId: id, products: [] });
        setBoxes([...copy]);
        Toast.show({
          type: "success",
          text1: "Box Added Successfully",
          visibilityTime: 1750,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Box already added",
          visibilityTime: 1750,
        });
      }
      return;
    }
    var product = products.find((i: any) => i.product?.ean == ean);

    if (product == null || product == undefined) {
      Toast.show({
        type: "error",
        text1: "Produto is not in the order",
        visibilityTime: 1750,
      });
      return;
    }

    setHasScanned(true);

    if (
      product?.units &&
      readings.filter((i) => i == ean).length >= product?.units
    ) {
      Toast.show({
        type: "error",
        text1: "All products have already been read",
        visibilityTime: 1750,
      });
    } else {
      setReadings((readings) => [...readings, ean]);
      Toast.show({
        type: "success",
        text1: "Reading Completed Successfully",
        visibilityTime: 1750,
      });
    }
  };

  if (shipmentOrder.statusId != OrderStatusEnum.Pending) {
    return (
      <FulfilledOrder shipmentOrder={shipmentOrder} productsList={products} />
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Order " + id,
        }}
      />
      <ConnectionAlert body="No connection to the sorter." />

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
  sub_heading: {
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 15,
  },
  subTitle: {
    fontSize: 16,
  },
});
