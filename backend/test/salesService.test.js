import test from "node:test";
import assert from "node:assert/strict";
import { buildSaleNumber, normalizeSaleItems } from "../src/services/salesService.js";

test("buildSaleNumber genera un identificador estable con fecha y sufijo", () => {
  const fakeDate = new Date("2026-04-13T15:16:17.000Z");
  const fakeRandomSource = () => Buffer.from([0xab, 0xcd, 0xef]);

  assert.equal(buildSaleNumber(fakeDate, fakeRandomSource), "VTA-20260413151617-ABCDEF");
});

test("normalizeSaleItems convierte cantidades y precios", () => {
  const items = normalizeSaleItems([
    { productId: "prod-1", quantity: "2", unitPrice: "10.5" },
    { productId: "prod-2", quantity: 1, unitPrice: "" }
  ]);

  assert.deepEqual(items, [
    { productId: "prod-1", quantity: 2, unitPrice: 10.5 },
    { productId: "prod-2", quantity: 1, unitPrice: null }
  ]);
});

test("normalizeSaleItems rechaza ventas sin items", () => {
  assert.throws(() => normalizeSaleItems([]), {
    message: "Debes agregar al menos un producto a la venta"
  });
});
