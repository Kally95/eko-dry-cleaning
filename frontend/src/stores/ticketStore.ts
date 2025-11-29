import { create } from 'zustand';
import { Company, Site, GarmentType, Order } from '../services/api';

interface TicketState {
  // Mode
  mode: 'CUSTOMER' | 'STAFF' | null;
  setMode: (mode: 'CUSTOMER' | 'STAFF') => void;

  // Company & Site
  selectedCompany: Company | null;
  selectedSite: Site | null;
  setCompany: (company: Company) => void;
  setSite: (site: Site) => void;

  // PIN
  pinVerified: boolean;
  setPinVerified: (verified: boolean) => void;

  // Order form data
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  garmentQuantities: Record<string, number>;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerEmail: (email: string) => void;
  setNotes: (notes: string) => void;
  setGarmentQuantity: (garmentId: string, quantity: number) => void;

  // Created order
  createdOrder: Order | null;
  setCreatedOrder: (order: Order) => void;

  // Reset functions
  resetForm: () => void;
  resetAll: () => void;
  resetToSiteSelection: () => void;
}

const initialState = {
  mode: null,
  selectedCompany: null,
  selectedSite: null,
  pinVerified: false,
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  notes: '',
  garmentQuantities: {},
  createdOrder: null,
};

export const useTicketStore = create<TicketState>((set) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),

  setCompany: (company) => set({ selectedCompany: company, selectedSite: null, pinVerified: false }),

  setSite: (site) => set({ selectedSite: site, pinVerified: false }),

  setPinVerified: (verified) => set({ pinVerified: verified }),

  setCustomerName: (name) => set({ customerName: name }),

  setCustomerPhone: (phone) => set({ customerPhone: phone }),

  setCustomerEmail: (email) => set({ customerEmail: email }),

  setNotes: (notes) => set({ notes }),

  setGarmentQuantity: (garmentId, quantity) =>
    set((state) => ({
      garmentQuantities: {
        ...state.garmentQuantities,
        [garmentId]: quantity,
      },
    })),

  setCreatedOrder: (order) => set({ createdOrder: order }),

  resetForm: () =>
    set({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      notes: '',
      garmentQuantities: {},
      createdOrder: null,
    }),

  resetAll: () => set(initialState),

  resetToSiteSelection: () =>
    set({
      selectedSite: null,
      pinVerified: false,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      notes: '',
      garmentQuantities: {},
      createdOrder: null,
    }),
}));
