import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface InterfaceStoreState {
    darkMode: boolean
    setDarkMode(active: boolean): void
    showAlert: boolean
    setShowAlert(showState: boolean): void
    refresh: boolean
    setRefresh(refreshState: boolean): void
}

export const useInterfaceStore = create<InterfaceStoreState>()(
    persist(
        (set, get) => ({
            darkMode: false,
            setDarkMode: (active: boolean) => set({ darkMode: active }),
            showAlert: false,
            setShowAlert: (showState: boolean) => set({ showAlert: showState }),
            refresh: false,
            setRefresh: (refreshState: boolean) => set({ refresh: refreshState })
        }),
        {
            name: "interfaceStore",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)