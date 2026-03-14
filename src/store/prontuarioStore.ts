import { create } from 'zustand'

interface ProntuarioState {
  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Prontuário em edição
  currentProntuarioId: string | null
  setCurrentProntuario: (id: string | null) => void

  // Dados temporários de anamnese (rascunho)
  anamneseDraft: Record<string, unknown> | null
  setAnamneseDraft: (data: Record<string, unknown> | null) => void

  // Busca global
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useProntuarioStore = create<ProntuarioState>((set) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Prontuário
  currentProntuarioId: null,
  setCurrentProntuario: (id) => set({ currentProntuarioId: id }),

  // Anamnese
  anamneseDraft: null,
  setAnamneseDraft: (data) => set({ anamneseDraft: data }),

  // Busca
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
