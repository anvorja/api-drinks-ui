import { act, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DnaRadar } from "../taste/DnaRadar"

const profile = {
  sweet: 40,
  sour: 100,
  bitter: 10,
  strong: 70,
  fruity: 85,
  herbal: 30,
  creamy: 0,
  fizzy: 20,
  spicy: 5,
}

describe("DnaRadar", () => {
  it("describes the top flavors for screen readers", () => {
    render(<DnaRadar series={[{ profile, label: "Tú" }]} />)
    expect(
      screen.getByRole("img", { name: "Tú: Ácido 100, Frutal 85, Intenso 70" })
    ).toBeInTheDocument()
  })

  it("shows the value of an axis on keyboard focus", async () => {
    render(<DnaRadar series={[{ profile, label: "Tú" }]} dominant={["sour"]} />)
    act(() => screen.getByRole("button", { name: "Frutal: 85 de 100" }).focus())
    expect(await screen.findByText("85")).toBeInTheDocument()
  })

  it("adds a legend when comparing two people", () => {
    render(
      <DnaRadar
        series={[
          { profile, label: "Tú" },
          { profile, label: "Laura", tone: "secondary" },
        ]}
      />
    )
    expect(screen.getByText("Laura")).toBeInTheDocument()
  })
})
