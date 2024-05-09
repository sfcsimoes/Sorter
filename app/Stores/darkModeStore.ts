import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WarehouseIdStoreState {
    darkMode: boolean
    setDarkMode(active: boolean): void
}

export const useDarkModeStore= create<WarehouseIdStoreState>()(
    persist(
        (set, get) => ({
            darkMode: false,
            setDarkMode: (active: boolean) => set({ darkMode: active })
        }),
        {
            name: "darkMode",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)