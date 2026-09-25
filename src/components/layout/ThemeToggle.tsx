import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { AnimatePresence, motion } from "motion/react"

import { Icon } from "@/components/common/Icon"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "@/hooks/useTheme"

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const label = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={toggleTheme}
          aria-label={label}
          className="relative overflow-hidden rounded-full"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={resolvedTheme}
              initial={{ y: -18, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 18, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="grid place-items-center"
            >
              <Icon icon={isDark ? Moon02Icon : Sun03Icon} />
            </motion.span>
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
