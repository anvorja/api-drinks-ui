import { Login01Icon, Logout01Icon } from "@hugeicons/core-free-icons"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"

import { Icon } from "@/components/common/Icon"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { ROLE_LABEL } from "@/lib/roles"
import { ACCOUNT_NAV, isNavItemVisible } from "./nav"

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <Button asChild size="lg" className="rounded-full px-4">
        <Link to="/entrar">
          <Icon icon={Login01Icon} className="size-4" />
          Entrar
        </Link>
      </Button>
    )
  }

  const onLogout = async () => {
    await logout()
    toast.success("Sesión cerrada. ¡Salud!")
    navigate("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full ring-offset-2 ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Menú de ${user.name}`}
        >
          <Avatar className="size-9 border border-amber/40">
            <AvatarFallback className="bg-gradient-to-br from-coral to-amber font-heading text-sm font-bold text-night">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-medium text-foreground">
            {user.name}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email} · {ROLE_LABEL[user.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACCOUNT_NAV.filter((item) => isNavItemVisible(item, user)).map(
          (item) => (
            <DropdownMenuItem key={item.to} asChild>
              <Link to={item.to}>
                <Icon icon={item.icon} className="size-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} variant="destructive">
          <Icon icon={Logout01Icon} className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
