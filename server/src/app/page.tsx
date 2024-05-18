"use client";

import {
  ArrowUpRight,
  Users,
  Package,
  Ban,
  Loader,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import * as React from "react";
import Link from "next/link";
import { atom, useAtom } from "jotai";
import { ShipmentOrder, OrderStatus, Warehouse } from "@/types";
import { getServerAuthSession } from "@/server/auth";

const warehousesAtom = atom<Warehouse[]>([]);
const orderStatusAtom = atom<OrderStatus[]>([]);

export default function Home() {
  // const session = await getServerAuthSession();
  const [data, setData] = React.useState<ShipmentOrder[]>([]);
  const [warehouses, setWarehouses] = useAtom(warehousesAtom);
  const [orderStatusList, setOrderStatusList] = useAtom(orderStatusAtom);

  const [isLoading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function getOrders() {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((d) => {
          setData(d);
        })
        .catch((error) => console.log(error));
    }
    async function getWarehouses() {
      fetch("/api/warehouses")
        .then((res) => res.json())
        .then((d) => {
          setWarehouses(d);
        })
        .catch((error) => console.log(error));
    }

    async function getOrderStatus() {
      fetch("/api/orderStatus")
        .then((res) => res.json())
        .then((json) => {
          setOrderStatusList(json);
        })
        .catch((error) => console.log(error));
    }
    Promise.all([getOrders(), getWarehouses(), getOrderStatus()]).then(
      (values) => {
        setLoading(false);
      },
    );
  }, []);

  const totalProducts = React.useMemo(() => {
    let count = 0;

    data
      .filter((order) => order.statusId == 2)
      .forEach((order) => {
        count = order.productsInShipmentOrders.length;
      });
    return count;
  }, [data]);

  function badgeStyle(type: number) {
    switch (type) {
      case 1:
        return "secondary";
      case 2:
        return "outline";
      case 3:
        return "outline";
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Orders Fulfilled
              </CardTitle>
              <Package className="4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.filter((i: any) => i.statusId == 2).length}
              </div>
              {/* <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Products Shipped
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Orders Pending
              </CardTitle>
              <Loader className="4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.filter((i: any) => i.statusId == 1).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Orders Canceled
              </CardTitle>
              <Ban className="4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.filter((i: any) => i.statusId == 3).length}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Orders</CardTitle>
                <CardDescription>Recent orders.</CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/orders">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Id</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isLoading ? (
                    data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-medium">{row.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {warehouses.find((i) => i.id == row.originId)?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {
                              warehouses.find((i) => i.id == row.destinationId)
                                ?.name
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            <Badge
                              className="text-xs"
                              variant={badgeStyle(row.statusId)}
                            >
                              {
                                orderStatusList.find(
                                  (i) => i.id == row.statusId,
                                )?.name
                              }
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24">
                        <div className="flex flex-1 items-center justify-center">
                          <Loader2 className="h-10 w-10 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Warehouses</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Origin Orders</TableHead>
                    <TableHead>Destination Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isLoading ? (
                    warehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell>
                          <div className="font-medium">{warehouse.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {
                              data.filter(
                                (i: any) => i.originId == warehouse.id,
                              ).length
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {
                              data.filter(
                                (i: any) => i.destinationId == warehouse.id,
                              ).length
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24">
                        <div className="flex flex-1 items-center justify-center">
                          <Loader2 className="h-10 w-10 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
