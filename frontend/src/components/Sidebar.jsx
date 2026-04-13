import { NavLink, useNavigate } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div>
        <p className="eyebrow">Sistema</p>
        <h1>Inventario</h1>
      </div>

      <nav className="nav-links">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/productos">Productos</NavLink>
        <NavLink to="/ventas">Ventas</NavLink>
        <NavLink to="/movimientos">Movimientos</NavLink>
      </nav>

      <button className="ghost-button" onClick={handleLogout}>
        Cerrar sesion
      </button>
    </aside>
  );
}
