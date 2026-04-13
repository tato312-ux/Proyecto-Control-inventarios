import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";
import { StatCard } from "../components/StatCard.jsx";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function formatDayLabel(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-BO", {
    weekday: "short"
  });
}

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalMovements: 0,
    outOfStockProducts: 0,
    totalInventoryValue: 0,
    movementsToday: 0,
    recentMovements: [],
    categoryDistribution: [],
    movementTrend: [],
    criticalProducts: []
  });

  useEffect(() => {
    async function loadData() {
      try {
        const dashboard = await apiRequest("/dashboard");
        setStats(dashboard);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, []);

  return (
    <div className="page-grid">
      <section>
        <div className="page-header">
          <div>
            <p className="eyebrow">Resumen</p>
            <h2>Dashboard</h2>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard label="Productos" value={stats.totalProducts} helper="Catalogo activo" />
          <StatCard
            label="Stock bajo"
            value={stats.lowStockProducts}
            helper="Requieren reposicion"
            tone="warning"
          />
          <StatCard
            label="Agotados"
            value={stats.outOfStockProducts}
            helper="Sin unidades disponibles"
            tone="danger"
          />
          <StatCard
            label="Movimientos hoy"
            value={stats.movementsToday}
            helper={`${stats.totalMovements} acumulados`}
            tone="accent"
          />
          <StatCard
            label="Valor inventario"
            value={formatCurrency(stats.totalInventoryValue)}
            helper="Estimado por stock actual"
          />
        </div>
      </section>

      <section className="dashboard-layout">
        <article className="panel">
          <div className="page-header">
            <div>
              <p className="eyebrow">Flujo</p>
              <h2>Entradas vs salidas</h2>
            </div>
          </div>

          <div className="trend-chart">
            {stats.movementTrend.map((day) => {
              const maxValue = Math.max(
                ...stats.movementTrend.flatMap((item) => [item.entradas, item.salidas]),
                1
              );
              const entradaHeight = `${(day.entradas / maxValue) * 100}%`;
              const salidaHeight = `${(day.salidas / maxValue) * 100}%`;

              return (
                <div className="trend-group" key={day.day}>
                  <div className="trend-bars">
                    <div className="trend-bar trend-bar-in" style={{ height: entradaHeight }} title={`Entradas: ${day.entradas}`} />
                    <div className="trend-bar trend-bar-out" style={{ height: salidaHeight }} title={`Salidas: ${day.salidas}`} />
                  </div>
                  <span>{formatDayLabel(day.day)}</span>
                </div>
              );
            })}
          </div>

          <div className="trend-legend">
            <span><i className="legend-dot legend-in"></i>Entradas</span>
            <span><i className="legend-dot legend-out"></i>Salidas</span>
          </div>
        </article>

        <article className="panel">
          <div className="page-header">
            <div>
              <p className="eyebrow">Distribucion</p>
              <h2>Productos por categoria</h2>
            </div>
          </div>

          <div className="distribution-list">
            {stats.categoryDistribution.length === 0 ? (
              <p className="muted">Aun no hay productos registrados.</p>
            ) : (
              stats.categoryDistribution.map((category) => {
                const maxTotal = Math.max(...stats.categoryDistribution.map((item) => item.total_products), 1);
                const width = `${(category.total_products / maxTotal) * 100}%`;

                return (
                  <article className="distribution-item" key={category.category_name}>
                    <div className="distribution-copy">
                      <strong>{category.category_name}</strong>
                      <span>{category.total_products} productos</span>
                    </div>
                    <div className="distribution-track">
                      <div className="distribution-fill" style={{ width }} />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-layout">
        <article className="panel">
          <div className="page-header">
            <div>
              <p className="eyebrow">Actividad</p>
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
                {stats.recentMovements.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="muted">Todavia no hay movimientos.</td>
                  </tr>
                ) : (
                  stats.recentMovements.map((movement) => (
                    <tr key={movement.id}>
                      <td>{new Date(movement.created_at).toLocaleString()}</td>
                      <td>{movement.product_name}</td>
                      <td>
                        <span className={`status-pill status-${movement.movement_type}`}>
                          {movement.movement_type}
                        </span>
                      </td>
                      <td>{movement.quantity}</td>
                      <td>{movement.user_name || "Sistema"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
        <div className="page-header">
          <div>
            <p className="eyebrow">Critico</p>
            <h2>Productos prioritarios</h2>
          </div>
        </div>

        <div className="list">
          {stats.criticalProducts.length === 0 ? (
            <p className="muted">No hay productos con stock bajo.</p>
          ) : (
            stats.criticalProducts.map((product) => (
              <article className="list-item" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <p className="muted">SKU: {product.sku}</p>
                </div>
                <div className="critical-meta">
                  <span className="badge">{product.current_stock} unidades</span>
                  <small>Minimo: {product.min_stock}</small>
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
