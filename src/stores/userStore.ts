import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'team_lead' | 'analyst';

interface UserState {
  userId: string | null;
  email: string | null;
  name: string | null;
  role: UserRole;
  teamId: string | null;
  credits: number;
  avatarUrl: string | null;
  
  // Actions
  setUser: (user: Partial<UserState>) => void;
  updateCredits: (credits: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      email: 'alex@company.com',
      name: 'Alex Morgan',
      role: 'admin',
      teamId: null,
      credits: 2450,
      avatarUrl: null,
      
      setUser: (user) => set((state) => ({ ...state, ...user })),
      updateCredits: (credits) => set({ credits }),
      clearUser: () => set({
        userId: null,
        email: null,
        name: null,
        role: 'analyst',
        teamId: null,
        credits: 0,
        avatarUrl: null,
      }),
    }),
    {
      name: 'user-storage',
    }
  )
);
