import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";

const initialMovement = {
  productId: "",
  movementType: "entrada",
  quantity: 1,
  note: ""
};

export function MovementsPage() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState(initialMovement);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [productData, movementData] = await Promise.all([
        apiRequest("/products"),
        apiRequest("/movements")
      ]);
      setProducts(productData);
      setMovements(movementData);
      if (!form.productId && productData[0]) {
        setForm((current) => ({ ...current, productId: productData[0].id }));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await apiRequest("/movements", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setForm((current) => ({ ...initialMovement, productId: current.productId || "" }));
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="page-header">
          <div>
            <p className="eyebrow">Operacion</p>
            <h2>Registrar movimiento</h2>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="full-width">
            Producto
            <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo
            <select
              value={form.movementType}
              onChange={(e) => setForm({ ...form, movementType: e.target.value })}
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </label>

          <label>
            Cantidad
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </label>

          <label className="full-width">
            Nota
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>

          {error ? <p className="error-text full-width">{error}</p> : null}

          <button type="submit" className="primary-button">
            Guardar movimiento
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="page-header">
          <div>
            <p className="eyebrow">Historial</p>
            <h2>Ultimos movimientos</h2>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td>{new Date(movement.created_at).toLocaleString()}</td>
                  <td>{movement.product_name}</td>
                  <td>{movement.movement_type}</td>
                  <td>{movement.quantity}</td>
                  <td>
                    {movement.user_name || "Sistema"}
                    {movement.sale_number ? ` · ${movement.sale_number}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
