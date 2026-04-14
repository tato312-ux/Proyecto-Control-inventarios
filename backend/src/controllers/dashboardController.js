import { pool } from "../db.js";
import { sendDatabaseError } from "../utils/http.js";

export async function getDashboard(_req, res) {
  try {
    const [
      products,
      lowStock,
      movements,
      outOfStock,
      inventoryValue,
      movementsToday,
      recentMovements,
      categoryDistribution,
      movementTrend,
      criticalProducts
    ] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS total FROM products"),
      pool.query("SELECT COUNT(*)::int AS total FROM products WHERE current_stock <= min_stock"),
      pool.query("SELECT COUNT(*)::int AS total FROM inventory_movements"),
      pool.query("SELECT COUNT(*)::int AS total FROM products WHERE current_stock = 0"),
      pool.query(
        "SELECT COALESCE(SUM(current_stock * sale_price), 0)::numeric(12,2) AS total FROM products"
      ),
      pool.query(
        "SELECT COUNT(*)::int AS total FROM inventory_movements WHERE DATE(created_at) = CURRENT_DATE"
      ),
      pool.query(`
        SELECT
          inventory_movements.id,
          inventory_movements.movement_type,
          inventory_movements.quantity,
          inventory_movements.created_at,
          inventory_movements.note,
          products.name AS product_name,
          products.sku,
          users.full_name AS user_name
        FROM inventory_movements
        JOIN products ON products.id = inventory_movements.product_id
        LEFT JOIN users ON users.id = inventory_movements.user_id
        ORDER BY inventory_movements.created_at DESC
        LIMIT 6
      `),
      pool.query(`
        SELECT
          COALESCE(categories.name, 'Sin categoria') AS category_name,
          COUNT(products.id)::int AS total_products
        FROM products
        LEFT JOIN categories ON categories.id = products.category_id
        GROUP BY COALESCE(categories.name, 'Sin categoria')
        ORDER BY total_products DESC, category_name ASC
        LIMIT 6
      `),
      pool.query(`
        SELECT
          TO_CHAR(day_ref, 'YYYY-MM-DD') AS day,
          COALESCE(SUM(CASE WHEN movement_type = 'entrada' THEN quantity ELSE 0 END), 0)::int AS entradas,
          COALESCE(SUM(CASE WHEN movement_type = 'salida' THEN quantity ELSE 0 END), 0)::int AS salidas
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS day_ref
        LEFT JOIN inventory_movements
          ON DATE(inventory_movements.created_at) = DATE(day_ref)
        GROUP BY day_ref
        ORDER BY day_ref ASC
      `),
      pool.query(`
        SELECT
          id,
          sku,
          name,
          current_stock,
          min_stock,
          (min_stock - current_stock) AS shortage
        FROM products
        WHERE current_stock <= min_stock
        ORDER BY shortage DESC, current_stock ASC, name ASC
        LIMIT 5
      `)
    ]);

    return res.json({
      totalProducts: products.rows[0].total,
      lowStockProducts: lowStock.rows[0].total,
      totalMovements: movements.rows[0].total,
      outOfStockProducts: outOfStock.rows[0].total,
      totalInventoryValue: Number(inventoryValue.rows[0].total || 0),
      movementsToday: movementsToday.rows[0].total,
      recentMovements: recentMovements.rows,
      categoryDistribution: categoryDistribution.rows,
      movementTrend: movementTrend.rows,
      criticalProducts: criticalProducts.rows
    });
  } catch (error) {
    return sendDatabaseError(res, error, "No se pudo cargar el dashboard");
  }
}
