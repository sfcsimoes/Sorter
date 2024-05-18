"use client";

import * as React from "react";
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
import { ListFilter, PlusCircle, Loader2, Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { atom, useAtom } from "jotai";
import Link from "next/link";
import { ShipmentOrder, OrderStatus, Warehouse } from "@/types";

const sheetAtom = atom(false);
const orderAtom = atom<any>({
  id: "",
  originId: "",
  destinationId: "",
  statusId: "",
  createdAt: "",
  updatedAt: "",
});

function badgeStyle(type: string) {
  switch (type) {
    case "1":
      return "secondary";
    case "2":
      return "outline";
    case "3":
      return "outline";
  }
}

const warehousesAtom = atom<Warehouse[]>([]);
const orderStatusAtom = atom<OrderStatus[]>([]);

export const columns: ColumnDef<ShipmentOrder>[] = [
  {
    accessorKey: "id",
    header: "Id",
    cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "originId",
    header: "Origin",
    cell: ({ row }) => {
      const [warehouses, setWarehouses] = useAtom(warehousesAtom);
      return (
        <div className="capitalize">
          {warehouses.find((i) => i.id == row.getValue("originId"))?.name}
        </div>
      );
    },
  },
  {
    accessorKey: "destinationId",
    header: "Destination",
    cell: ({ row }) => {
      const [warehouses, setWarehouses] = useAtom(warehousesAtom);
      return (
        <div className="capitalize">
          {warehouses.find((i) => i.id == row.getValue("destinationId"))?.name}
        </div>
      );
    },
  },
  {
    accessorKey: "statusId",
    header: "Status",
    cell: ({ row }) => {
      const [orderStatusList, setorderStatusList] = useAtom(orderStatusAtom);
      return (
        <Badge
          className="text-xs"
          variant={badgeStyle(row.getValue("statusId"))}
        >
          {orderStatusList.find((i) => i.id == row.getValue("statusId"))?.name}
        </Badge>
      );
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="capitalize">
        {new Date(row.getValue("createdAt")).toLocaleDateString(navigator.language, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => (
      <div className="capitalize">
        {new Date(row.getValue("updatedAt")).toLocaleDateString(navigator.language, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
    ),
  },
];

export default function OrdersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [data, setData] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);
  const [openSheet, setSheetOpen] = useAtom(sheetAtom);
  const [warehouses, setWarehouses] = useAtom(warehousesAtom);
  const [orderStatusList, setorderStatusList] = useAtom(orderStatusAtom);

  React.useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  }, [openSheet]);

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
        setorderStatusList(json);
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });


  return (
    <div className="w-full space-y-1.5 p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Orders</h1>
      </div>
      <div className="flex items-center py-4">
        {/* <AddOrder /> */}
        <Link href="/orders/add">
          <Button size="default" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Order
            </span>
          </Button>
        </Link>
        {/* <EditOrder /> */}

        <div className="ms-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ms-2 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={
                  (table.getColumn("statusId")?.getFilterValue() as string) ??
                  ""
                }
                // onValueChange={setPosition}
                onValueChange={(event) =>
                  table
                    .getColumn("statusId")
                    ?.setFilterValue(event)
                }
              >
                <DropdownMenuRadioItem value="1">Pending</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="2">
                  Fulfilled
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="3">
                  Canceled
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                <TableRow key={row.id}>
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
