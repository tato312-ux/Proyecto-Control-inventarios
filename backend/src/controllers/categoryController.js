import { pool } from "../db.js";

export async function getCategories(_req, res) {
  const { rows } = await pool.query("SELECT * FROM categories ORDER BY name ASC");
  return res.json(rows);
}

export async function createCategory(req, res) {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "El nombre es obligatorio" });
  }

  const query = `
    INSERT INTO categories (name, description)
    VALUES ($1, $2)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [name, description || null]);
  return res.status(201).json(rows[0]);
}
