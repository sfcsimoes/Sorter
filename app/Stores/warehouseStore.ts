import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WarehouseIdStoreState {
    warehouseId: number
    setWarehouseId(newId: number): void
}

export const useWarehouseStore = create<WarehouseIdStoreState>()(
    persist(
        (set, get) => ({
            warehouseId: 0,
            setWarehouseId: (newId: any) => set({ warehouseId: newId })
        }),
        {
            name: "warehouseId",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)