import { z } from "zod";
import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function discordLogin() {
  window.location.href = "/api/auth/discord";
}

export async function googleLogin() {
  window.location.href = "/api/auth/google";  
}

export async function logout() {
  await apiRequest("POST", "/api/auth/logout");
  window.location.href = "/";
}

export function isAdmin(user?: AuthUser | null) {
  return user?.role === "admin" || user?.role === "owner" || user?.role === "sub-owner";
}

export function isOwner(user?: AuthUser | null) {
  return user?.role === "owner" || user?.role === "sub-owner";
}
