"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ArrowUpDown,
  PlusCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  OrderStatus,
  OrderStatusEnum,
  Product,
  ShipmentOrder,
  Warehouse,
} from "@/types";
import utcToLocal from "@/helpers/dateHelper";

export default function Component({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = React.useState<Product[]>([]);
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [orderStatusList, setOrderStatusLists] = React.useState<OrderStatus[]>(
    [],
  );
  const [products, setProducts] = React.useState<[]>([]);
  const [order, setOrder] = React.useState<ShipmentOrder>();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/products?getBoxes=false")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
      });

    fetch("/api/orderStatus")
      .then((res) => res.json())
      .then((json) => {
        setOrderStatusLists(json);
      })
      .catch((error) => console.log(error));

    fetch("/api/warehouses")
      .then((res) => res.json())
      .then((d) => {
        setWarehouses(d);
      })
      .catch((error) => console.log(error));

    fetch("/api/order?id=" + params.id)
      .then((res) => res.json())
      .then((orderObject) => {
        setOrder(orderObject);
      })
      .catch((error) => console.log(error));

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mt-4 flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-lg font-semibold md:text-xl">
          Shipment Order #{order?.id} -{" "}
          {order?.statusId && OrderStatusEnum[order?.statusId]}
        </h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Origin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div>
                <span className="font-medium">Warehouse Name: </span>
                {warehouses.find((i) => i.id == order?.originId)?.name}
              </div>
              <div>
                <span className="font-medium">Address: </span>
                {warehouses.find((i) => i.id == order?.originId)?.address}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Destination</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div>
                <span className="font-medium">Warehouse Name: </span>
                {warehouses.find((i) => i.id == order?.destinationId)?.name}
              </div>
              <div>
                <span className="font-medium">Address: </span>
                {warehouses.find((i) => i.id == order?.destinationId)?.address}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div>
                <span className="font-medium">Status: </span>
                {order?.statusId && OrderStatusEnum[order?.statusId]}
              </div>
              <div>
                <span className="font-medium">Name: </span>
                {order?.fulfilledBy?.name}
              </div>
              <div>
                <span className="font-medium">Updated At: </span>
                {utcToLocal(order?.updatedAt || "")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Ean</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>In Box</TableHead>
                <TableHead>Box Id</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order?.productsInShipmentOrders.map((item, index: any) => (
                <TableRow>
                  <TableCell className="font-semibold">
                    {item.product.name}
                  </TableCell>
                  <TableCell>{item.product.ean}</TableCell>
                  <TableCell>{item.units}</TableCell>
                  <TableCell>
                    {item.isInTransportationBox ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    {item.transportationBoxId ? item.transportationBoxId : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
