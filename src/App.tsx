import { useState } from "react";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/Registerpage";
import AdminPanel from "./components/AdminPanel";
import CarritoModal from "./components/CarritoModal";
import { obtenerUsuarioActual, cerrarSesion, type UsuarioSesion } from "./services/authService";
import "./App.css";

export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string;
  categoria?: string;
}

export interface ItemCarrito extends Producto {
  cantidad: number;
}

const PRODUCTOS_CATALOGO: Producto[] = [
  { id: 1, nombre: "Air Force 1", marca: "Nike", precio: 850, imagen: "air-force-1.png", categoria: "Calzado / Urbano" },
  { id: 2, nombre: "Air Max", marca: "Nike", precio: 950, imagen: "air-max.png", categoria: "Calzado / Running" },
  { id: 3, nombre: "Cortez", marca: "Nike", precio: 700, imagen: "cortez.png", categoria: "Calzado / Clásico" },
  { id: 4, nombre: "Volver al Futuro (Air Mag)", marca: "Nike", precio: 3500, imagen: "air-mag.png", categoria: "Colección Exclusiva" },
  { id: 5, nombre: "Samba", marca: "Adidas", precio: 800, imagen: "samba.png", categoria: "Calzado / Tendencia" },
  { id: 6, nombre: "Gazelle", marca: "Adidas", precio: 780, imagen: "gazelle.png", categoria: "Calzado / Casual" },
  { id: 7, nombre: "Campus", marca: "Adidas", precio: 820, imagen: "campus.png", categoria: "Calzado / Skate" },
  { id: 8, nombre: "Turino II", marca: "Puma", precio: 650, imagen: "turino-2.png", categoria: "Calzado / Deportivo" },
  { id: 9, nombre: "Turino II OG", marca: "Puma", precio: 680, imagen: "turino-2-og.png", categoria: "Calzado / Retro" },
  { id: 10, nombre: "9060", marca: "New Balance", precio: 1100, imagen: "nb-9060.png", categoria: "Calzado / Lujo Urbano" },
  { id: 11, nombre: "Zig Dynamica 4", marca: "Reebok", precio: 750, imagen: "zig-dynamica.png", categoria: "Calzado / Training" },
  { id: 12, nombre: "Slip-ins Uno", marca: "Skechers", precio: 620, imagen: "slip-ins.png", categoria: "Calzado / Confort" },
  { id: 13, nombre: "Chuck Taylor All-Star", marca: "Converse", precio: 550, imagen: "chuck-taylor.png", categoria: "Calzado / Leyenda" },
];

export default function App() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => obtenerUsuarioActual());
  const [vista, setVista] = useState<"login" | "registro">("login");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [modalCarritoAbierto, setModalCarritoAbierto] = useState(false);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id: number, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nuevaCant = item.cantidad + delta;
            return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
          }
          return item;
        })
        .filter((item): item is ItemCarrito => item !== null)
    );
  };

  const eliminarProducto = (id: number) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const manejarCerrarSesion = () => {
    cerrarSesion();
    setUsuario(null);
    setVista("login");
  };

  if (!usuario) {
    if (vista === "registro") {
      return (
        <RegisterPage
          onRegistroExitoso={() => setVista("login")}
          onVolverALogin={() => setVista("login")}
        />
      );
    }
    return (
      <LoginPage
        onLoginExitoso={() => setUsuario(obtenerUsuarioActual())}
        onIrARegistro={() => setVista("registro")}
      />
    );
  }

  return (
    <div className="ecommerce-site">
      {usuario.rol === "administrador" ? (
        <AdminPanel usuario={usuario} onCerrarSesion={manejarCerrarSesion} />
      ) : (
        <>
          {/* 1. Barra Superior de Anuncios */}
          <div className="top-announcement-bar">
            <div className="announcement-content">
              <span>💳 Paga en cuotas sin recargo con Visa y Mastercard</span>
            </div>
          </div>

          {/* 2. Encabezado Claro con LOGO de imagen */}
          <header className="main-header">
            <div className="header-container">
              <div className="brand-logo">
                <img src="logo.png" alt="K-SHOES Logo" className="header-logo-img" />
              </div>

              <nav className="nav-categories">
                <a href="#catalogo" className="cat-link active">⚡ LO MÁS NUEVO</a>
                <a href="#catalogo" className="cat-link">CALZADO</a>
                <a href="#catalogo" className="cat-link">OFERTAS 🔥</a>
                <a href="#catalogo" className="cat-link">K-SHOES CLUB ⚽</a>
              </nav>

              <div className="header-user-actions">
                <span className="user-name">Hola, <strong>{usuario.nombreCompleto}</strong></span>
                <button
                  className="btn-cart-trigger"
                  onClick={() => setModalCarritoAbierto(true)}
                >
                  🛒 Carrito <span className="cart-badge">{totalItems}</span>
                </button>
                <button className="btn-logout-link" onClick={manejarCerrarSesion}>
                  Salir
                </button>
              </div>
            </div>
          </header>

          {/* 3. Catálogo Principal de Productos */}
          <main id="catalogo" className="catalog-section">
            <div className="catalog-header">
              <h2>Catálogo Principal de Zapatillas</h2>
              <div className="divider-line"></div>
            </div>

            <div className="products-grid">
              {PRODUCTOS_CATALOGO.map((prod) => (
                <div key={prod.id} className="product-card">
                  <span className="brand-tag">{prod.marca}</span>
                  <div className="product-image-box">
                    <img
                      src={prod.imagen}
                      alt={prod.nombre}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="product-details">
                    <span className="product-cat">{prod.categoria}</span>
                    <h3 className="product-title">{prod.nombre}</h3>
                    <div className="product-bottom">
                      <span className="product-price">Q{prod.precio.toLocaleString()}</span>
                      <button
                        className="btn-buy-now"
                        onClick={() => agregarAlCarrito(prod)}
                      >
                        Añadir al Carrito
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* 4. Pie de Página de Beneficios */}
          <footer className="features-footer">
            <div className="features-container">
              <div className="feature-box">
                <div className="icon">🚚</div>
                <h4>Envíos a toda Guatemala</h4>
                <p>Entrega rápida y garantizada</p>
              </div>
              <div className="feature-box">
                <div className="icon">💳</div>
                <h4>Pago 100% Seguro</h4>
                <p>Tarjeta de débito o crédito</p>
              </div>
              <div className="feature-box">
                <div className="icon">🛡️</div>
                <h4>Sitio de Confianza</h4>
                <p>Garantía directa en tu compra</p>
              </div>
              <div className="feature-box">
                <div className="icon">👟</div>
                <h4>Productos Originales</h4>
                <p>Calidad certificada</p>
              </div>
            </div>
          </footer>

          {/* Modal del Carrito y Recibo */}
          <CarritoModal
            abierto={modalCarritoAbierto}
            onCerrar={() => setModalCarritoAbierto(false)}
            carrito={carrito}
            onCambiarCantidad={cambiarCantidad}
            onEliminarProducto={eliminarProducto}
            onVaciarCarrito={vaciarCarrito}
            nombreCliente={usuario.nombreCompleto}
          />
        </>
      )}
    </div>
  );
}