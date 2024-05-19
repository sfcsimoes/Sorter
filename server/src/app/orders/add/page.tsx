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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { OrderStatus, Product, Warehouse } from "@/types";

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: any) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: any) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "ean",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ean
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("ean")}</div>,
  },
  {
    accessorKey: "isTransportationBox",
    header: "Box",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("isTransportationBox") ? "True" : " False"}
      </div>
    ),
  },
];

export default function Component() {
  const router = useRouter();
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
const [data, setData] = React.useState<Product[]>([]);

  const productSchema = z.object({
    id: z.string(),
    name: z.string().min(3, {
      message: "Name must be at least 3 characters.",
    }),
    ean: z.string().min(12, {
      message: "EAN must be at least 12 characters.",
    }),
    units: z.number().min(1),
  });

  const formSchema = z
    .object({
      originId: z.string(),
      destinationId: z.string(),
      statusId: z.string(),
      products: z.array(productSchema).min(1, {
        message: "Choose at least one product",
      }),
    })
    .refine((i) => i.originId !== i.destinationId, {
      message: "Origin e destination must be different",
      path: ["destinationId"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originId: "0",
      destinationId: "0",
      statusId: "1",
      products: [],
    },
  });

  const origin = form.watch("originId");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let request = await fetch("/api/order", {
      method: "POST",
      body: JSON.stringify(values),
    });
    if (request.status == 200) {
      toast({
        title: "Success",
        description: "Order added successfully",
        duration: 2000,
      });
      router.push("/orders");
    }
  }

  React.useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
      })
      .catch((error) => console.log(error));
  }, []);
  
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [orderStatusList, setOrderStatusLists] = React.useState<OrderStatus[]>([]);
  const [products, setProducts] = React.useState<[]>([]);

  React.useEffect(() => {
    fetch("/api/warehouses")
      .then((res) => res.json())
      .then((d) => {
        setWarehouses(d);
      })
      .catch((error) => console.log(error));
  }, []);

  React.useEffect(() => {
    fetch("/api/orderStatus")
      .then((res) => res.json())
      .then((json) => {
        setOrderStatusLists(json);
      })
      .catch((error) => console.log(error));
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  function addProductsToList() {
    let items: any[] = products;
    for (var prop in rowSelection) {
      let product = data.find((i) => i.id == prop);
      let item = {
        id: product?.id.toString(),
        name: product?.name,
        ean: product?.ean,
        units: 1,
      };
      let found = items.find((i) => i.id == item.id);
      if (!found) {
        items.push(item);
      }
    }
    form.setValue("products", items);
    table.toggleAllRowsSelected(false);
  }

  return (
    <div className="container mt-4">
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
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          New Order
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Discard
          </Button>
          <Button size="sm" type="submit" form="hook-form">
            Save Order
          </Button>
        </div>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  id="hook-form"
                >
                  <FormField
                    control={form.control}
                    name="originId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select a origin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {warehouses.map((warehouse) => {
                                return (
                                  <SelectItem
                                    key={warehouse.id.toString()}
                                    value={warehouse.id.toString()}
                                  >
                                    {warehouse.name}
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destinationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select a fruit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {warehouses.map((warehouse) => {
                              return (
                                <SelectItem
                                  key={warehouse.id.toString()}
                                  value={warehouse.id.toString()}
                                >
                                  {warehouse.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="statusId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select the order status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                            {orderStatusList.map((orderStatusItem) => {
                                return (
                                  <SelectItem
                                    key={orderStatusItem.id.toString()}
                                    value={orderStatusItem.id.toString()}
                                  >
                                    {orderStatusItem.name}
                                  </SelectItem>
                                );
                              })}
                              {/* <SelectItem value="Pendente">Pendente</SelectItem>
                              <SelectItem value="Concluida">
                                Concluida
                              </SelectItem>
                              <SelectItem value="Cancelada">
                                Cancelada
                              </SelectItem> */}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
        {origin != "0" ? (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Add products and quantities</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger>
                  <Button size="sm" variant="default" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Products
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Products</DialogTitle>
                    <DialogDescription>
                      <div className="flex items-center py-4">
                        <Input
                          placeholder="Filter name..."
                          value={
                            (table
                              .getColumn("name")
                              ?.getFilterValue() as string) ?? ""
                          }
                          onChange={(event) =>
                            table
                              .getColumn("name")
                              ?.setFilterValue(event.target.value)
                          }
                          className="ms-2 max-w-xs"
                        />
                      </div>
                      <div className="mt-2 overflow-auto rounded-md border">
                        <Table>
                          <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                  return (
                                    <TableHead key={header.id}>
                                      {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                          )}
                                    </TableHead>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {table.getRowModel().rows?.length ? (
                              table.getRowModel().rows.map((row) => (
                                <TableRow
                                  key={row.id}
                                  data-state={row.getIsSelected() && "selected"}
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={columns.length}
                                  className="h-24 text-center"
                                >
                                  No results.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex items-center space-x-2 py-4">
                        <div className="me-auto space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                          >
                            Next
                          </Button>
                        </div>
                        <DialogClose asChild>
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1"
                            disabled={Object.keys(rowSelection).length === 0}
                            onClick={addProductsToList}
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Add Product
                          </Button>
                        </DialogClose>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} id="hook-form">
                  <FormField
                    control={form.control}
                    name="products"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        {fieldState.error ? (
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                              <FormMessage />
                            </AlertDescription>
                          </Alert>
                        ) : (
                          ""
                        )}
                      </FormItem>
                    )}
                  />
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Ean</TableHead>
                        <TableHead>Units</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((item: any, index: any) => (
                        <TableRow>
                          <TableCell className="font-semibold">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            {item.ean}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              key={`products.${index}.units`}
                              name={`products.${index}.units`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      onChange={(event) =>
                                        field.onChange(+event.target.value)
                                      }
                                      type="number"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Add products and quantities</CardDescription>
            </CardHeader>
            <CardContent>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-center text-xl font-semibold tracking-tight sm:grow-0">
                Choose an origin warehouse
              </h1>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
