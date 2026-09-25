const money = new Map<string, Intl.NumberFormat>()

/** 89000 COP → "$ 89.000". */
export function formatMoney(amount: number, currency = "COP") {
  let format = money.get(currency)
  if (!format) {
    format = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "COP" ? 0 : 2,
    })
    money.set(currency, format)
  }
  return format.format(amount)
}

const dateFormat = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" })
const dateTimeFormat = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
})

export const formatDate = (iso: string) => dateFormat.format(new Date(iso))
export const formatDateTime = (iso: string) =>
  dateTimeFormat.format(new Date(iso))

/** 0.34 → "34 %". */
export const formatPercent = (ratio: number) => `${Math.round(ratio * 100)} %`
