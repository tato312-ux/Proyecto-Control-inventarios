import { pool } from "../db.js";

function buildSaleNumber() {
  const stamp = Date.now().toString().slice(-8);
  return `VTA-${stamp}`;
}

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
      return res.status(500).json({
        message: "Falta aplicar la migracion de ventas en PostgreSQL"
      });
    }

    return res.status(500).json({
      message: "No se pudieron cargar las ventas",
      error: error.message
    });
  }
}

export async function createSale(req, res) {
  const { customerName, customerDocument, note, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Debes agregar al menos un producto a la venta" });
  }

  const normalizedItems = items.map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity),
    unitPrice: item.unitPrice === undefined || item.unitPrice === "" ? null : Number(item.unitPrice)
  }));

  if (normalizedItems.some((item) => !item.productId || item.quantity <= 0 || Number.isNaN(item.quantity))) {
    return res.status(400).json({ message: "Todos los items deben tener producto y cantidad valida" });
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
        return res.status(404).json({ message: "Uno de los productos no existe" });
      }

      if (product.current_stock < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Stock insuficiente para ${product.name}. Disponible: ${product.current_stock}`
        });
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
      return res.status(500).json({
        message: "Falta aplicar la migracion de ventas en PostgreSQL"
      });
    }

    return res.status(500).json({ message: "No se pudo registrar la venta", error: error.message });
  } finally {
    client.release();
  }
}
