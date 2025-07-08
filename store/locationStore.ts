import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Location = {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
};

type LocationState = {
  locations: Location[];
  selectedLocation: Location | null;
  addLocation: (loc: Location) => void;
  setSelectedLocation: (loc: Location | null) => void;
  removeLocation: (id: string) => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      locations: [],
      selectedLocation: null,
      addLocation: (loc) => set((state) => ({ locations: [loc, ...state.locations] })),
      setSelectedLocation: (loc) => set({ selectedLocation: loc }),
      removeLocation: (id) => set((state) => ({ locations: state.locations.filter((loc) => loc.id !== id) })),
      
    }),
    {
      name: 'location-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);