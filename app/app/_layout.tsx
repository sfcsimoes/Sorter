import { Slot } from "expo-router";
import { SessionProvider } from "@/auth/ctx";
import React from "react";
import { DatabaseHelper } from "@/db/database";

export default function Root() {
  var db = new DatabaseHelper();
  // db.dropDatabase();
  db.Migration();
  React.useEffect(() => {
    async function setup() {
      var db = new DatabaseHelper();
      await db.syncWarehouses();
      await db.syncProducts();
      await db.syncOrderStatus();
    }
    setup();
  }, []);
  // Set up the auth context and render our layout inside of it.
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
