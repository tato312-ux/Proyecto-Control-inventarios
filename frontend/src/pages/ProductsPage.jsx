import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";

const initialForm = {
  sku: "",
  name: "",
  description: "",
  minStock: 0,
  currentStock: 0,
  salePrice: 0,
  unit: "unidad"
};

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProducts() {
    try {
      const data = await apiRequest("/products");
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setForm(initialForm);
      setSuccess("Producto registrado correctamente");
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="page-header">
          <div>
            <p className="eyebrow">Catalogo</p>
            <h2>Registrar producto</h2>
            <p className="muted">
              Crea el producto indicando cuantas unidades tienes hoy y desde que cantidad quieres recibir alerta.
            </p>
          </div>
        </div>

        <div className="field-guide-grid">
          <article className="field-guide-card">
            <span className="field-guide-kicker">Existencias actuales</span>
            <strong>{form.currentStock || 0}</strong>
            <p>Es la cantidad real disponible ahora mismo en tu almacen.</p>
          </article>

          <article className="field-guide-card">
            <span className="field-guide-kicker">Avisar cuando queden</span>
            <strong>{form.minStock || 0}</strong>
            <p>Cuando el stock llegue a este numero, el sistema lo marcara como bajo.</p>
          </article>

          <article className="field-guide-card">
            <span className="field-guide-kicker">Como pensarlo</span>
            <strong>{Number(form.currentStock || 0) <= Number(form.minStock || 0) ? "Atento" : "Normal"}</strong>
            <p>
              Si las existencias actuales son iguales o menores al limite, el producto aparecera en alertas.
            </p>
          </article>
        </div>

        <form className="form-grid product-form" onSubmit={handleSubmit}>
          <label>
            Codigo interno (SKU)
            <input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="Ej. PROD-001"
            />
            <small>Codigo unico para identificar el producto.</small>
          </label>
          <label>
            Nombre
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Teclado mecanico"
            />
            <small>Nombre con el que lo veras en ventas e inventario.</small>
          </label>
          <label className="full-width">
            Descripcion del producto
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detalles, marca, color o especificaciones"
            />
            <small>Opcional, pero ayuda a reconocer mejor el producto.</small>
          </label>
          <label>
            Avisarme cuando queden
            <input
              type="number"
              min="0"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
            />
            <small>Ejemplo: si pones 5, el sistema te avisara cuando queden 5 o menos.</small>
          </label>
          <label>
            Cuantas unidades tienes hoy
            <input
              type="number"
              min="0"
              value={form.currentStock}
              onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
            />
            <small>Es la cantidad inicial con la que se registrara el producto.</small>
          </label>
          <label>
            Precio de venta
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
            />
            <small>Precio sugerido de venta por unidad.</small>
          </label>
          <label>
            Unidad de medida
            <input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="unidad, caja, kg, litro"
            />
            <small>Como se mide este producto.</small>
          </label>

          {error ? <p className="error-text full-width">{error}</p> : null}
          {success ? <p className="success-text full-width">{success}</p> : null}

          <button type="submit" className="primary-button">
            Guardar producto
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="page-header">
          <div>
            <p className="eyebrow">Inventario</p>
            <h2>Productos registrados</h2>
            <p className="muted">Aqui veras el stock actual y el limite definido para cada producto.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Stock actual</th>
                <th>Limite alerta</th>
                <th>Precio venta</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.current_stock}</td>
                  <td>{product.min_stock}</td>
                  <td>${product.sale_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
