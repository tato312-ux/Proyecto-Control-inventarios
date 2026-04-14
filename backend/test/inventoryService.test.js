import test from "node:test";
import assert from "node:assert/strict";
import { calculateUpdatedStock } from "../src/services/inventoryService.js";

test("calculateUpdatedStock suma stock en entradas", () => {
  assert.equal(calculateUpdatedStock(10, "entrada", 5), 15);
});

test("calculateUpdatedStock resta stock en salidas", () => {
  assert.equal(calculateUpdatedStock(10, "salida", 4), 6);
});

test("calculateUpdatedStock reemplaza stock en ajustes", () => {
  assert.equal(calculateUpdatedStock(10, "ajuste", 3), 3);
});

test("calculateUpdatedStock rechaza stock negativo", () => {
  assert.throws(() => calculateUpdatedStock(2, "salida", 5), {
    message: "No se puede dejar el stock en negativo"
  });
});

test("calculateUpdatedStock rechaza tipos invalidos", () => {
  assert.throws(() => calculateUpdatedStock(10, "transferencia", 1), {
    message: "Tipo de movimiento no valido"
  });
});
