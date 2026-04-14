import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { createToken } from "../utils/token.js";
import { sendDatabaseError, sendError, sendInternalError } from "../utils/http.js";

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, "Email y password son obligatorios");
  }

  try {
    const query = `
      SELECT users.id, users.full_name, users.email, users.password_hash, roles.name AS role
      FROM users
      JOIN roles ON roles.id = users.role_id
      WHERE users.email = $1
    `;
    const { rows } = await pool.query(query, [email]);
    const user = rows[0];

    if (!user) {
      return sendError(res, 401, "Credenciales invalidas");
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return sendError(res, 401, "Credenciales invalidas");
    }

    const token = createToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return sendInternalError(res, error, "No se pudo iniciar sesion");
  }
}

export async function register(req, res) {
  const { fullName, email, password, role = "almacen" } = req.body;

  if (!fullName || !email || !password) {
    return sendError(res, 400, "Faltan campos obligatorios");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const roleResult = await client.query("SELECT id, name FROM roles WHERE name = $1", [role]);
    const roleRow = roleResult.rows[0];

    if (!roleRow) {
      await client.query("ROLLBACK");
      return sendError(res, 400, "Rol no valido");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertUser = `
      INSERT INTO users (full_name, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email
    `;

    const { rows } = await client.query(insertUser, [fullName, email, passwordHash, roleRow.id]);
    await client.query("COMMIT");

    return res.status(201).json({
      user: {
        id: rows[0].id,
        fullName: rows[0].full_name,
        email: rows[0].email,
        role: roleRow.name
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return sendDatabaseError(res, error, "No se pudo registrar el usuario");
  } finally {
    client.release();
  }
}
