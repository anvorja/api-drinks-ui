import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { ErrorState } from "../common/States"
import { ApiError } from "@/lib/api/errors"

const renderAt = (error: unknown) =>
  render(
    <MemoryRouter initialEntries={["/bebida/11007"]}>
      <ErrorState error={error} />
    </MemoryRouter>
  )

describe("ErrorState", () => {
  it("shows the age gate for AGE_RESTRICTED, coming back after sign-in", () => {
    renderAt(new ApiError({ status: 403, code: "AGE_RESTRICTED", message: "" }))
    expect(screen.getByText("Solo para mayores de 18")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/entrar?next=%2Fbebida%2F11007"
    )
  })

  it("offers the plans on PLAN_LIMIT", () => {
    renderAt(new ApiError({ status: 402, code: "PLAN_LIMIT", message: "" }))
    expect(screen.getByRole("link", { name: "Ver planes" })).toHaveAttribute(
      "href",
      "/planes"
    )
  })

  it("quotes the request id on unexpected errors", () => {
    renderAt(
      new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        message: "",
        requestId: "req-42",
      })
    )
    expect(screen.getByText("Ref: req-42")).toBeInTheDocument()
  })
})
