import { pool } from "../db.js";
import { sendDatabaseError, sendError } from "../utils/http.js";

export async function getCategories(_req, res) {
  try {
    const { rows } = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    return res.json(rows);
  } catch (error) {
    return sendDatabaseError(res, error, "No se pudieron cargar las categorias");
  }
}

export async function createCategory(req, res) {
  const { name, description } = req.body;

  if (!name) {
    return sendError(res, 400, "El nombre es obligatorio");
  }

  try {
    const query = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [name, description || null]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    return sendDatabaseError(res, error, "No se pudo registrar la categoria");
  }
}
