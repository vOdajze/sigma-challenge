import { create } from "zustand";
import type { UsuarioResponse } from "@/types";

interface AuthState {
  user: UsuarioResponse | null;
  status: "idle" | "loading" | "done";
  setUser: (user: UsuarioResponse | null) => void;
  setStatus: (status: AuthState["status"]) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "idle",
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  clear: () => set({ user: null, status: "done" }),
}));
