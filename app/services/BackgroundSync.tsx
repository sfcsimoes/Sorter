import { useServerConnectionStore } from "@/Stores/serverConnectionStore";
import { DatabaseHelper } from "@/db/database";
import React, { useEffect } from "react";

const BackgroundSync = () => {
  const { hasConnection, setConnection } = useServerConnectionStore();
  useEffect(() => {
    let db = new DatabaseHelper();
    const syncDataInBackground = async () => {
      try {
        // Perform data syncing here
        const result = await db.useFetch("/api/health", "GET", "", 5);
        if (result.wasSuccessful) {
          setConnection(true);
          db.sendShipmentOrders();
        } else {
          throw "API DOWN";
        }
      } catch (error) {
        setConnection(false);
      }
    };

    const backgroundSyncInterval = setInterval(() => {
      syncDataInBackground();
    }, 30 * 1000); // Execute every 30 sec

    return () => {
      clearInterval(backgroundSyncInterval);
    };
  }, []);

  return <></>;
};

export default BackgroundSync;
