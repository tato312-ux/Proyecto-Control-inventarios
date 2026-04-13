import { pool } from "../db.js";

export async function getMovements(_req, res) {
  const query = `
    SELECT
      inventory_movements.*,
      products.name AS product_name,
      products.sku,
      sales.sale_number,
      users.full_name AS user_name
    FROM inventory_movements
    JOIN products ON products.id = inventory_movements.product_id
    LEFT JOIN sales ON sales.id = inventory_movements.sale_id
    LEFT JOIN users ON users.id = inventory_movements.user_id
    ORDER BY inventory_movements.created_at DESC
  `;
  const { rows } = await pool.query(query);
  return res.json(rows);
}

export async function createMovement(req, res) {
  const { productId, movementType, quantity, note } = req.body;

  if (!productId || !movementType || !quantity) {
    return res.status(400).json({ message: "Producto, tipo y cantidad son obligatorios" });
  }

  const qty = Number(quantity);

  if (qty <= 0) {
    return res.status(400).json({ message: "La cantidad debe ser mayor a cero" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      "SELECT id, current_stock FROM products WHERE id = $1 FOR UPDATE",
      [productId]
    );
    const product = productResult.rows[0];

    if (!product) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    let newStock = product.current_stock;

    if (movementType === "entrada") {
      newStock += qty;
    } else if (movementType === "salida") {
      newStock -= qty;
    } else if (movementType === "ajuste") {
      newStock = qty;
    } else {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Tipo de movimiento no valido" });
    }

    if (newStock < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "No se puede dejar el stock en negativo" });
    }

    await client.query(
      `INSERT INTO inventory_movements (product_id, user_id, movement_type, quantity, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [productId, req.user.id, movementType, qty, note || null]
    );

    await client.query("UPDATE products SET current_stock = $1 WHERE id = $2", [newStock, productId]);
    await client.query("COMMIT");

    return res.status(201).json({ message: "Movimiento registrado", currentStock: newStock });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "No se pudo registrar el movimiento", error: error.message });
  } finally {
    client.release();
  }
}
