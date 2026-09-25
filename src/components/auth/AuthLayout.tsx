import type { ReactNode } from "react"

import { DnaRadar } from "@/components/taste/DnaRadar"

const SAMPLE = {
  sweet: 45,
  sour: 100,
  bitter: 20,
  strong: 70,
  fruity: 85,
  herbal: 55,
  creamy: 10,
  fizzy: 40,
  spicy: 15,
}

/** Two halves on desktop: the form, and a glimpse of what the account unlocks. */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-2 lg:items-center">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-plum via-night to-night p-10 text-white lg:block"
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-amber uppercase">
          Ejemplo de ADN
        </p>
        <p className="mt-3 font-heading text-3xl font-bold text-balance">
          Espíritu ácido y rebelde con alma frutal
        </p>
        <DnaRadar
          series={[{ profile: SAMPLE, label: "Ejemplo" }]}
          dominant={["sour", "fruity", "strong"]}
          className="mx-auto mt-6 max-w-sm [&_.fill-muted-foreground]:fill-white/60"
        />
        <p className="mt-4 text-center text-sm text-white/70">
          Haz swipe y el tuyo aparece en minutos.
        </p>
      </aside>
    </div>
  )
}
