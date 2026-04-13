import { pool } from "../db.js";

export async function getProducts(_req, res) {
  try {
    const query = `
      SELECT
        products.*,
        categories.name AS category_name,
        suppliers.name AS supplier_name
      FROM products
      LEFT JOIN categories ON categories.id = products.category_id
      LEFT JOIN suppliers ON suppliers.id = products.supplier_id
      ORDER BY products.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "No se pudieron cargar los productos", error: error.message });
  }
}

export async function getLowStockProducts(_req, res) {
  try {
    const query = `
      SELECT *
      FROM products
      WHERE current_stock <= min_stock
      ORDER BY current_stock ASC, name ASC
    `;
    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "No se pudo cargar el stock bajo", error: error.message });
  }
}

export async function createProduct(req, res) {
  const {
    sku,
    name,
    description,
    categoryId,
    supplierId,
    unit,
    minStock,
    currentStock,
    salePrice
  } = req.body;

  if (!sku || !name) {
    return res.status(400).json({ message: "SKU y nombre son obligatorios" });
  }

  const parsedMinStock = Number(minStock || 0);
  const parsedCurrentStock = Number(currentStock || 0);
  const parsedSalePrice = Number(salePrice || 0);

  if ([parsedMinStock, parsedCurrentStock, parsedSalePrice].some(Number.isNaN)) {
    return res.status(400).json({ message: "Stock y precio deben tener valores numericos validos" });
  }

  if (parsedMinStock < 0 || parsedCurrentStock < 0 || parsedSalePrice < 0) {
    return res.status(400).json({ message: "Stock y precio no pueden ser negativos" });
  }

  try {
    const query = `
      INSERT INTO products (
        sku, name, description, category_id, supplier_id, unit, min_stock, current_stock, sale_price
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      sku.trim(),
      name.trim(),
      description || null,
      categoryId || null,
      supplierId || null,
      unit || "unidad",
      parsedMinStock,
      parsedCurrentStock,
      parsedSalePrice
    ];

    const { rows } = await pool.query(query, values);
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ message: "Ya existe un producto con ese SKU" });
    }

    return res.status(500).json({ message: "No se pudo registrar el producto", error: error.message });
  }
}
