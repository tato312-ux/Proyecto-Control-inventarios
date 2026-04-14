export function calculateUpdatedStock(currentStock, movementType, quantity) {
  const normalizedCurrentStock = Number(currentStock);
  const normalizedQuantity = Number(quantity);

  if (!Number.isFinite(normalizedCurrentStock) || normalizedCurrentStock < 0) {
    throw new Error("Stock actual invalido");
  }

  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
    throw new Error("La cantidad debe ser un entero positivo");
  }

  if (movementType === "entrada") {
    return normalizedCurrentStock + normalizedQuantity;
  }

  if (movementType === "salida") {
    const newStock = normalizedCurrentStock - normalizedQuantity;

    if (newStock < 0) {
      throw new Error("No se puede dejar el stock en negativo");
    }

    return newStock;
  }

  if (movementType === "ajuste") {
    return normalizedQuantity;
  }

  throw new Error("Tipo de movimiento no valido");
}
