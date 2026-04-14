import { NavLink, useNavigate } from "react-router-dom";
import { clearSession, readUser } from "../auth.js";

export function Sidebar() {
  const navigate = useNavigate();
  const user = readUser();

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div>
        <p className="eyebrow">Sistema</p>
        <h1>Inventario</h1>
        {user ? <p className="muted">Sesion: {user.fullName} ({user.role})</p> : null}
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
