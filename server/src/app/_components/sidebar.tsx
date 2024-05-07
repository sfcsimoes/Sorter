"use client";

import Link from "next/link";
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  Users,
  Truck,
  Warehouse
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { usePathname } from "next/navigation";

export default function SideBar() {
  const pathname = usePathname();
  const isActive = (path: string) => path === pathname;

  const NavLinks = [
    { id: 1, name: "Dashboard", path: "/", icon: Home },
    { id: 2, name: "Orders", path: "/orders", icon: Truck },
    { id: 3, name: "Products", path: "/products", icon: Package },
    { id: 4, name: "Users", path: "/users", icon: Users },
    { id: 5, name: "Analytics", path: "/analytics", icon: LineChart },
    { id: 6, name: "Warehouses", path: "/warehouses", icon: Warehouse },
  ];

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Worter Smart Solver</span>
          </Link>
          {/* <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button> */}
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {NavLinks.map((link) => {
              return (
                <Link
                  key={link.id}
                  href={link.path}
                  className={
                    isActive(link.path)
                      ? "flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all"
                      : "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  }
                >
                  {isActive(link.path)}
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}