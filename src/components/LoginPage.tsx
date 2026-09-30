import { useState, type FormEvent } from "react";
import { iniciarSesion } from "../services/authService";
import "./LoginPage.css";

interface LoginPageProps {
  onLoginExitoso: () => void;
  onIrARegistro: () => void;
}

export default function LoginPage({ onLoginExitoso, onIrARegistro }: LoginPageProps) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!usuario.trim() || !contrasena.trim()) {
      setError("Por favor, ingresa tu usuario y contraseña.");
      return;
    }

    setCargando(true);
    try {
      const exito = await iniciarSesion(usuario.trim(), contrasena);
      if (exito) {
        onLoginExitoso();
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-fondo">
      <div className="login-tarjeta">
        <div className="login-logo">
          {/* Carga el logo.png guardado en la carpeta public/ */}
          <img
            src="logo.png"
            alt="K-SHOES Logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const altIcon = document.getElementById("login-logo-alt");
              if (altIcon) altIcon.classList.remove("oculto");
            }}
          />
          <span id="login-logo-alt" className="login-logo-alterno oculto">👟</span>
        </div>

        <h1 className="login-titulo">K-SHOES</h1>
        <p className="login-subtitulo">Control de Ventas</p>

        <form onSubmit={manejarSubmit}>
          <label className="login-etiqueta">Usuario:</label>
          <input
            type="text"
            className="login-input"
            placeholder="Tu usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            disabled={cargando}
          />

          <label className="login-etiqueta">Contraseña:</label>
          <div className="login-input-contrasena">
            <input
              type={mostrarContrasena ? "text" : "password"}
              className="login-input"
              placeholder="Tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={cargando}
            />
            <button
              type="button"
              className="login-boton-ojo"
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
              tabIndex={-1}
            >
              {mostrarContrasena ? "🙈" : "👁️"}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-boton" disabled={cargando}>
            {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <button type="button" className="login-enlace-registro" onClick={onIrARegistro}>
          ¿Primera vez? Crea tu cuenta
        </button>
      </div>
    </div>
  );
}