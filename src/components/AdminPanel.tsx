import type { UsuarioSesion } from "../services/authService";
import ProductosAdmin from "./ProductosAdmin";
import "./AdminPanel.css";

interface AdminPanelProps {
  usuario: UsuarioSesion;
  onCerrarSesion: () => void;
}

// Secciones que se irán activando conforme se construyan los módulos del diagrama.
const PROXIMAMENTE = ["Órdenes", "Facturación y pagos", "Contabilidad"];

export default function AdminPanel({ usuario, onCerrarSesion }: AdminPanelProps) {
  return (
    <div className="admin">
      <aside className="admin-menu">
        <div className="admin-marca">K-SHOES</div>
        <nav>
          <button className="admin-menu-item activo">Productos y stock</button>
          {PROXIMAMENTE.map((nombre) => (
            <button key={nombre} className="admin-menu-item" disabled>
              {nombre} <small>(pronto)</small>
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-principal">
        <header className="admin-encabezado">
          <div>
            <strong>{usuario.nombreCompleto}</strong>
            <span className="admin-rol">{usuario.rol}</span>
          </div>
          <button className="btn btn-secundario" onClick={onCerrarSesion}>
            Cerrar sesión
          </button>
        </header>

        <main className="admin-contenido">
          <ProductosAdmin puedeEditar={usuario.rol === "administrador"} />
        </main>
      </div>
    </div>
  );
}