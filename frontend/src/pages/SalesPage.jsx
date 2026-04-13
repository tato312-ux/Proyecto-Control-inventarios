import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api.js";

const initialLine = {
  productId: "",
  quantity: 1,
  unitPrice: ""
};

const initialForm = {
  customerName: "",
  customerDocument: "",
  note: "",
  items: [initialLine]
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function SalesPage() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      const [productData, salesData] = await Promise.all([
        apiRequest("/products"),
        apiRequest("/sales")
      ]);
      setProducts(productData);
      setSales(salesData);

      if (productData[0] && !form.items[0]?.productId) {
        setForm((current) => ({
          ...current,
          items: current.items.map((item, index) =>
            index === 0 ? { ...item, productId: productData[0].id } : item
          )
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateItem(index, field, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  }

  function addItem() {
    setForm((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          ...initialLine,
          productId: products[0]?.id || ""
        }
      ]
    }));
  }

  function removeItem(index) {
    setForm((current) => {
      const nextItems = current.items.filter((_, itemIndex) => itemIndex !== index);

      return {
        ...current,
        items: nextItems.length > 0 ? nextItems : [{ ...initialLine, productId: products[0]?.id || "" }]
      };
    });
  }

  const summary = useMemo(() => {
    return form.items.reduce(
      (acc, item) => {
        const product = products.find((entry) => entry.id === item.productId);
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unitPrice || product?.sale_price || 0);
        const subtotal = quantity * unitPrice;

        return {
          quantity: acc.quantity + quantity,
          total: acc.total + subtotal
        };
      },
      { quantity: 0, total: 0 }
    );
  }, [form.items, products]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        items: form.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: item.unitPrice === "" ? undefined : Number(item.unitPrice)
        }))
      };

      const response = await apiRequest("/sales", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setSuccess(`Venta ${response.sale.sale_number} registrada correctamente`);
      setForm({
        ...initialForm,
        items: [
          {
            ...initialLine,
            productId: products[0]?.id || ""
          }
        ]
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-grid">
      <section className="dashboard-layout">
        <article className="panel">
          <div className="page-header">
            <div>
              <p className="eyebrow">Comercial</p>
              <h2>Registrar venta</h2>
            </div>
          </div>

          <form className="page-grid" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Cliente
                <input
                  value={form.customerName}
                  onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                  placeholder="Nombre del cliente"
                />
              </label>
              <label>
                Documento
                <input
                  value={form.customerDocument}
                  onChange={(event) => setForm({ ...form, customerDocument: event.target.value })}
                  placeholder="CI, NIT o referencia"
                />
              </label>
              <label className="full-width">
                Nota
                <textarea
                  value={form.note}
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                  placeholder="Observaciones de la venta"
                />
              </label>
            </div>

            <div className="sale-lines">
              <div className="page-header">
                <div>
                  <p className="eyebrow">Detalle</p>
                  <h2>Productos vendidos</h2>
                </div>
                <button type="button" className="secondary-button" onClick={addItem}>
                  Agregar linea
                </button>
              </div>

              {form.items.map((item, index) => {
                const product = products.find((entry) => entry.id === item.productId);
                const subtotal = Number(item.quantity || 0) * Number(item.unitPrice || product?.sale_price || 0);

                return (
                  <article className="sale-line-card" key={`${item.productId}-${index}`}>
                    <div className="sale-line-grid">
                      <label className="full-width">
                        Producto
                        <select
                          value={item.productId}
                          onChange={(event) => updateItem(index, "productId", event.target.value)}
                        >
                          {products.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.name} ({entry.sku}) - Stock: {entry.current_stock}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Cantidad
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateItem(index, "quantity", event.target.value)}
                        />
                      </label>
                      <label>
                        Precio unitario
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                          placeholder={product ? product.sale_price : "0"}
                        />
                      </label>
                      <div className="sale-subtotal">
                        <span>Subtotal</span>
                        <strong>{formatCurrency(subtotal)}</strong>
                      </div>
                    </div>

                    {form.items.length > 1 ? (
                      <button type="button" className="link-button" onClick={() => removeItem(index)}>
                        Quitar linea
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>

            {error ? <p className="error-text">{error}</p> : null}
            {success ? <p className="success-text">{success}</p> : null}

            <div className="sale-summary">
              <div>
                <span>Total items</span>
                <strong>{summary.quantity}</strong>
              </div>
              <div>
                <span>Total venta</span>
                <strong>{formatCurrency(summary.total)}</strong>
              </div>
            </div>

            <button type="submit" className="primary-button">
              Registrar venta
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="page-header">
            <div>
              <p className="eyebrow">Resumen</p>
              <h2>Ultimas ventas</h2>
            </div>
          </div>

          <div className="sales-history">
            {sales.length === 0 ? (
              <p className="muted">Todavia no hay ventas registradas.</p>
            ) : (
              sales.map((sale) => (
                <article className="sale-history-card" key={sale.id}>
                  <div className="sale-history-head">
                    <div>
                      <strong>{sale.sale_number}</strong>
                      <p className="muted">
                        {sale.customer_name || "Consumidor final"} - {new Date(sale.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="badge">{formatCurrency(sale.total_amount)}</span>
                  </div>

                  <div className="sale-history-items">
                    {sale.items.map((item) => (
                      <div className="sale-history-item" key={item.id}>
                        <span>{item.productName}</span>
                        <small>
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </small>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
