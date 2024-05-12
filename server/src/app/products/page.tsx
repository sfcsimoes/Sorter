"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, PlusCircle, Loader2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { atom, useAtom } from "jotai";
import { Product } from "@/types";

const sheetAtom = atom(false);
const sheetUpdateAtom = atom(false);
const productAtom = atom<Product>({
  id: "",
  name: "",
  ean: "",
  isTransportationBox: false,
  createdAt: "",
  updatedAt: "",
});

export const columns: ColumnDef<Product>[] = [
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
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("createdAt")}</div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("updatedAt")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
      const [openSheet, setSheetOpen] = useAtom(sheetUpdateAtom);
      const [productA, setProductA] = useAtom(productAtom);

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSheetOpen(true);
                  setProductA(product);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];

function AddProduct() {
  const { toast } = useToast();
  const [openSheet, setSheetOpen] = useAtom(sheetAtom);

  const formSchema = z.object({
    name: z.string().min(3, {
      message: "Name must be at least 3 characters.",
    }),
    ean: z.string().min(12, {
      message: "EAN must be at least 12 characters.",
    }),
    isTransportationBox: z.boolean().default(false),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ean: "",
      isTransportationBox: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    let request = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify(values),
    });
    if (request.status == 200) {
      setSheetOpen(false);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    }
  }

  return (
    <Sheet open={openSheet} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button size="default" className="gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Product
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Product</SheetTitle>
          {/* <SheetDescription>
                Make changes to your profile here. Click save when you're done.
              </SheetDescription> */}
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ean"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ean</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isTransportationBox"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch id="airplane-mode" />
                  </FormControl>
                  <FormLabel>
                    <Label htmlFor="airplane-mode" className="ms-2">
                      Is Box
                    </Label>
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

function EditProduct() {
  const { toast } = useToast();
  const [openSheet, setSheetOpen] = useAtom(sheetUpdateAtom);
  const [product, setProductA] = useAtom(productAtom);

  const formSchema = z.object({
    id: z.number(),
    name: z.string().min(3, {
      message: "Name must be at least 3 characters.",
    }),
    ean: z.string(),
    isTransportationBox: z.boolean().default(false),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: 0,
      name: "",
      ean: "",
      isTransportationBox: false,
    },
  });

  React.useEffect(() => {
    form.setValue("id", parseInt(product.id));
    form.setValue("name", product.name);
    form.setValue("ean", product.ean);
    form.setValue("isTransportationBox", product.isTransportationBox);
  }, [openSheet]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let request = await fetch("/api/products", {
      method: "PUT",
      body: JSON.stringify(values),
    });
    if (request.status == 200) {
      setSheetOpen(false);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    }
  }

  return (
    <Sheet open={openSheet} onOpenChange={setSheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Product</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ean"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ean</FormLabel>
                  <FormControl>
                    <Input disabled placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isTransportationBox"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch disabled id="airplane-mode" />
                  </FormControl>
                  <FormLabel>
                    <Label htmlFor="airplane-mode" className="ms-2">
                      Is Box
                    </Label>
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [data, setData] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);
  const [openSheet] = useAtom(sheetAtom);
  const [openSheetUpdate] = useAtom(sheetUpdateAtom);

  React.useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  }, [openSheet, openSheetUpdate]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-1.5 p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Products</h1>
      </div>
      <div className="flex items-center py-4">
        <AddProduct />
        <EditProduct />
        <Input
          placeholder="Filter name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="ms-auto max-w-xs"
        />
      </div>
      <div className="rounded-md border">
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
                <TableCell colSpan={columns.length} className="h-24">
                  {isLoading ? (
                    <div className="flex flex-1 items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin" />
                    </div>
                  ) : (
                    <p className="text-center">No results.</p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
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
      </div>
    </div>
  );
}
