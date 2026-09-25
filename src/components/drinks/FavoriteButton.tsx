import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { cn } from "cn"
import { motion } from "motion/react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import { Icon } from "@/components/common/Icon"
import { Button } from "@/components/ui/button"
import { useFavoriteToggle } from "@/hooks/api/useFavorites"
import { useAuth } from "@/hooks/useAuth"
import { errorMessage } from "@/lib/api/errors"

export function FavoriteButton({
  drinkId,
  className,
}: {
  drinkId: string
  className?: string
}) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isFavorite, toggle } = useFavoriteToggle(drinkId)

  const onClick = async () => {
    if (!user) {
      navigate(`/entrar?next=${encodeURIComponent(`/bebida/${drinkId}`)}`)
      return
    }
    try {
      await toggle()
      toast.success(
        isFavorite ? "Quitada de favoritos" : "Guardada. Tu ADN se actualizó ✨"
      )
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="lg"
      onClick={onClick}
      aria-pressed={isFavorite}
      className={cn("rounded-full", className)}
    >
      <motion.span
        key={String(isFavorite)}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <Icon
          icon={FavouriteIcon}
          className={cn("size-4", isFavorite && "fill-current")}
        />
      </motion.span>
      {isFavorite ? "En favoritos" : "Favorito"}
    </Button>
  )
}
