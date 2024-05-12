import React from "react";
import { useStorageState } from "./useStorageState";

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: async (email: string, password: string) => true,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email: string, password: string) => {
          // Perform sign-in logic here
          var response = await fetch(
            process.env.EXPO_PUBLIC_API_URL + "/api/login",
            {
              method: "POST",
              body: JSON.stringify({
                email: email,
                password: password,
              }),
            }
          );
          let user = JSON.parse(await response.text());
          if (response.status == 200 && user) {
            setSession(JSON.stringify(user));
            return true;
          }
          return false;
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
