import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { createToken } from "../utils/token.js";

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y password son obligatorios" });
  }

  const query = `
    SELECT users.id, users.full_name, users.email, users.password_hash, roles.name AS role
    FROM users
    JOIN roles ON roles.id = users.role_id
    WHERE users.email = $1
  `;
  const { rows } = await pool.query(query, [email]);
  const user = rows[0];

  if (!user) {
    return res.status(401).json({ message: "Credenciales invalidas" });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    return res.status(401).json({ message: "Credenciales invalidas" });
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
}

export async function register(req, res) {
  const { fullName, email, password, role = "almacen" } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const roleResult = await client.query("SELECT id, name FROM roles WHERE name = $1", [role]);
    const roleRow = roleResult.rows[0];

    if (!roleRow) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Rol no valido" });
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
    return res.status(500).json({ message: "No se pudo registrar el usuario", error: error.message });
  } finally {
    client.release();
  }
}
