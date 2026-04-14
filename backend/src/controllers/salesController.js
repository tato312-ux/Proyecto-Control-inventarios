import { pool } from "../db.js";
import { buildSaleNumber, normalizeSaleItems } from "../services/salesService.js";
import { sendDatabaseError, sendError } from "../utils/http.js";

export async function getSales(_req, res) {
  try {
    const query = `
      SELECT
        sales.id,
        sales.sale_number,
        sales.customer_name,
        sales.customer_document,
        sales.note,
        sales.total_amount,
        sales.created_at,
        users.full_name AS user_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sale_items.id,
              'productId', sale_items.product_id,
              'productName', products.name,
              'sku', products.sku,
              'quantity', sale_items.quantity,
              'unitPrice', sale_items.unit_price,
              'subtotal', sale_items.subtotal
            )
            ORDER BY sale_items.id
          ) FILTER (WHERE sale_items.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM sales
      LEFT JOIN users ON users.id = sales.created_by
      LEFT JOIN sale_items ON sale_items.sale_id = sales.id
      LEFT JOIN products ON products.id = sale_items.product_id
      GROUP BY sales.id, users.full_name
      ORDER BY sales.created_at DESC
      LIMIT 20
    `;

    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (error) {
    if (error.code === "42P01") {
      return sendError(res, 500, "Falta aplicar la migracion de ventas en PostgreSQL");
    }

    return sendDatabaseError(res, error, "No se pudieron cargar las ventas");
  }
}

export async function createSale(req, res) {
  const { customerName, customerDocument, note, items } = req.body;
  let normalizedItems;

  try {
    normalizedItems = normalizeSaleItems(items);
  } catch (error) {
    return sendError(res, 400, error.message);
  }

  if (
    normalizedItems.some(
      (item) =>
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        Number.isNaN(item.unitPrice) ||
        (item.unitPrice !== null && item.unitPrice < 0)
    )
  ) {
    return sendError(res, 400, "Todos los items deben tener producto, cantidad y precio validos");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const saleNumber = buildSaleNumber();
    const itemsWithTotals = [];
    let totalAmount = 0;

    for (const item of normalizedItems) {
      const productResult = await client.query(
        "SELECT id, name, sku, current_stock, sale_price FROM products WHERE id = $1 FOR UPDATE",
        [item.productId]
      );
      const product = productResult.rows[0];

      if (!product) {
        await client.query("ROLLBACK");
        return sendError(res, 404, "Uno de los productos no existe");
      }

      if (product.current_stock < item.quantity) {
        await client.query("ROLLBACK");
        return sendError(
          res,
          400,
          `Stock insuficiente para ${product.name}. Disponible: ${product.current_stock}`
        );
      }

      const unitPrice = item.unitPrice ?? Number(product.sale_price);
      const subtotal = Number((unitPrice * item.quantity).toFixed(2));

      itemsWithTotals.push({
        ...item,
        name: product.name,
        sku: product.sku,
        unitPrice,
        subtotal
      });

      totalAmount += subtotal;
    }

    const saleResult = await client.query(
      `INSERT INTO sales (sale_number, customer_name, customer_document, note, total_amount, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, sale_number, total_amount, created_at`,
      [
        saleNumber,
        customerName || null,
        customerDocument || null,
        note || null,
        totalAmount,
        req.user.id
      ]
    );
    const sale = saleResult.rows[0];

    for (const item of itemsWithTotals) {
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [sale.id, item.productId, item.quantity, item.unitPrice, item.subtotal]
      );

      await client.query(
        `INSERT INTO inventory_movements (product_id, user_id, sale_id, movement_type, quantity, note)
         VALUES ($1, $2, $3, 'salida', $4, $5)`,
        [item.productId, req.user.id, sale.id, item.quantity, `Venta ${sale.sale_number}`]
      );

      await client.query(
        "UPDATE products SET current_stock = current_stock - $1 WHERE id = $2",
        [item.quantity, item.productId]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Venta registrada correctamente",
      sale: {
        ...sale,
        items: itemsWithTotals
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "42P01") {
      return sendError(res, 500, "Falta aplicar la migracion de ventas en PostgreSQL");
    }

    return sendDatabaseError(res, error, "No se pudo registrar la venta");
  } finally {
    client.release();
  }
}
