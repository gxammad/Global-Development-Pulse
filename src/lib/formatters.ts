export function formatValue(
  value: number | null | undefined,
  format: "currency" | "percentage" | "number" | "decimal" = "decimal",
  unit?: string
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "—";
  }

  switch (format) {
    case "currency": {
      if (Math.abs(value) >= 1e12) {
        return `$${(value / 1e12).toFixed(2)}T`;
      }
      if (Math.abs(value) >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
      }
      if (Math.abs(value) >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
      }
      if (Math.abs(value) >= 1e3) {
        return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
      }
      return `$${value.toFixed(2)}`;
    }

    case "percentage": {
      return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
    }

    case "number": {
      if (Math.abs(value) >= 1e9) {
        return `${(value / 1e9).toFixed(2)}B`;
      }
      if (Math.abs(value) >= 1e6) {
        return `${(value / 1e6).toFixed(2)}M`;
      }
      if (Math.abs(value) >= 1e3) {
        return value.toLocaleString("en-US");
      }
      return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
    }

    case "decimal":
    default: {
      if (Math.abs(value) >= 1e6) {
        return `${(value / 1e6).toFixed(2)}M`;
      }
      return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    }
  }
}

export function formatRawNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function formatDateUTC(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toUTCString().replace("GMT", "UTC");
  } catch {
    return dateStr;
  }
}
