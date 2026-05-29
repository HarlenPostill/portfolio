import type { MetricUnit } from "./data";

export type UnitSystem = "metric" | "cup";

const FRACTIONS: [number, string][] = [
  [1 / 8, "⅛"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [3 / 8, "⅜"],
  [1 / 2, "½"],
  [5 / 8, "⅝"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [7 / 8, "⅞"],
];

export function formatAmount(raw: number): string {
  if (raw === 0) return "0";
  if (raw >= 100) return Math.round(raw).toString();
  if (raw >= 10) return (Math.round(raw * 2) / 2).toString();

  const whole = Math.floor(raw);
  const fractional = raw - whole;

  if (fractional < 0.04) return whole > 0 ? whole.toString() : "";

  for (const [val, sym] of FRACTIONS) {
    if (Math.abs(fractional - val) < 0.06) {
      return whole > 0 ? `${whole}${sym}` : sym;
    }
  }

  return raw < 1 ? raw.toFixed(1) : (Math.round(raw * 4) / 4).toFixed(1);
}

export function convertUnit(
  amount: number,
  unit: MetricUnit,
  system: UnitSystem,
): { amount: number; unit: string } {
  if (system === "metric") return { amount, unit };

  switch (unit) {
    case "g":
      if (amount >= 453) return { amount: amount / 453.592, unit: "lb" };
      return { amount: amount * 0.035274, unit: "oz" };
    case "kg":
      return { amount: amount * 2.20462, unit: "lb" };
    case "ml":
      if (amount >= 60) return { amount: amount / 240, unit: "cup" };
      if (amount >= 15) return { amount: amount / 15, unit: "tbsp" };
      return { amount: amount / 5, unit: "tsp" };
    case "L":
      return { amount: amount * 4.22675, unit: "cup" };
    default:
      return { amount, unit };
  }
}
