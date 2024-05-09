import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ServerConnectionState {
    hasConnection: boolean
    setConnection(active: boolean): void
}

export const useServerConnectionStore = create<ServerConnectionState>()(
    persist(
        (set, get) => ({
            hasConnection: false,
            setConnection: (active: boolean) => set({ hasConnection: active })
        }),
        {
            name: "server-connection",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)