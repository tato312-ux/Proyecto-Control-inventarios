import { randomBytes } from "node:crypto";

function formatDatePart(date) {
  const iso = date.toISOString().replace(/[-:TZ.]/g, "");
  return iso.slice(0, 14);
}

export function buildSaleNumber(date = new Date(), randomSource = randomBytes) {
  const suffix = randomSource(3).toString("hex").toUpperCase();
  return `VTA-${formatDatePart(date)}-${suffix}`;
}

export function normalizeSaleItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Debes agregar al menos un producto a la venta");
  }

  return items.map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity),
    unitPrice: item.unitPrice === undefined || item.unitPrice === "" ? null : Number(item.unitPrice)
  }));
}
