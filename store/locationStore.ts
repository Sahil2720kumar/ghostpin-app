import { create } from 'zustand';

export type Location = {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
};

type LocationState = {
  locations: Location[];
  addLocation: (loc: Location) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  locations: [],
  addLocation: (loc) => set((state) => ({ locations: [loc, ...state.locations] })),
})); 