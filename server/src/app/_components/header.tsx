"use client";

import Link from "next/link";
import {
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  ShoppingCart,
  Users,
  Truck,
  Warehouse,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { ModeToggle } from "@/app/_components/themeButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownAvatar } from "@/app/_components/dropdownAvatar";

export default function Header(props: { session: any }) {
  const pathname = usePathname();
  const isActive = (path: string) => path === pathname;

  const NavLinks = [
    { id: 2, name: "Orders", path: "/orders", icon: Truck },
    { id: 3, name: "Products", path: "/products", icon: Package },
    { id: 4, name: "Users", path: "/users", icon: Users },
    { id: 5, name: "Warehouses", path: "/warehouses", icon: Warehouse },
  ];

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Worter Smart Solver</span>
            </Link>
            {NavLinks.map((link) => {
              return (
                <Link
                  key={link.id}
                  href={link.path}
                  className={
                    isActive(link.path)
                      ? "ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      : "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  }
                >
                  {isActive(link.path)}
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1"></div>
      <ModeToggle />
      <div className="d-flex me-2">
        <DropdownAvatar session={props.session} />
      </div>
    </header>
  );
}
