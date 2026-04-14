import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { getValidToken, onAuthChange } from "./auth.js";
import { Sidebar } from "./components/Sidebar.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { MovementsPage } from "./pages/MovementsPage.jsx";
import { ProductsPage } from "./pages/ProductsPage.jsx";
import { SalesPage } from "./pages/SalesPage.jsx";

function ProtectedLayout() {
  const location = useLocation();
  const [token, setToken] = useState(() => getValidToken());

  useEffect(() => {
    const syncAuth = () => setToken(getValidToken());
    const cleanup = onAuthChange(syncAuth);
    const intervalId = window.setInterval(syncAuth, 60_000);

    return () => {
      cleanup();
      window.clearInterval(intervalId);
    };
  }, []);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content">
        <div className="page-transition" key={location.pathname}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/ventas" element={<SalesPage />} />
            <Route path="/movimientos" element={<MovementsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
