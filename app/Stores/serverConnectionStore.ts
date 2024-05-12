import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ServerConnectionState {
    hasConnection: boolean
    showConnectionAlert: boolean
    setConnection(active: boolean): void
    setShowConnectionAlert(active: boolean): void
}

export const useServerConnectionStore = create<ServerConnectionState>()(
    persist(
        (set, get) => ({
            hasConnection: false,
            showConnectionAlert: true,
            setConnection: (active: boolean) => set({ hasConnection: active }),
            setShowConnectionAlert: (active: boolean) => set({ showConnectionAlert: active })
        }),
        {
            name: "server-connection",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)