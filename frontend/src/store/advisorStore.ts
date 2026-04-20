import { create } from 'zustand'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

interface AdvisorState {
  language: 'English' | 'Hindi'
  messages: ChatMessage[]
  loading: boolean
  bookingTriggered: boolean
  
  setLanguage: (lang: 'English' | 'Hindi') => void
  addMessage: (msg: ChatMessage) => void
  setLoading: (loading: boolean) => void
  setBookingTriggered: (triggered: boolean) => void
  reset: () => void
}

export const useAdvisorStore = create<AdvisorState>((set) => ({
  language: 'English',
  messages: [],
  loading: false,
  bookingTriggered: false,

  setLanguage: (lang) => set({ language: lang }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ loading }),
  setBookingTriggered: (triggered) => set({ bookingTriggered: triggered }),
  reset: () => set({ messages: [], loading: false, bookingTriggered: false }),
}))
