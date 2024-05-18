import { useServerConnectionStore } from "@/Stores/serverConnectionStore";
import React, { useEffect } from "react";

const BackgroundSync = () => {
  const { hasConnection, setConnection } = useServerConnectionStore();
  useEffect(() => {
    const syncDataInBackground = async () => {
      try {
        // Perform data syncing here
        // console.log("Data sync completed in the background");
        let response = await fetch(
          process.env.EXPO_PUBLIC_API_URL + "/api/health"
        );
        if (response.status != 200) {
          throw "API DOWN";
        } else {
          setConnection(true);
        }
      } catch (error) {
        // console.error("Background sync error:", error);
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
