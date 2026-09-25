import type { User } from "@/lib/auth/session"

export const ROLE_LABEL: Record<User["role"], string> = {
  user: "Usuario",
  premium: "Premium",
  bartender: "Bartender",
  venue_owner: "Dueño de bar",
  admin: "Admin",
}
