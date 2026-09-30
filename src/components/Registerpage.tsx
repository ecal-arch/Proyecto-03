import { useState, type FormEvent } from "react";
import { registrarUsuario } from "../services/authService";
import "./LoginPage.css";

interface RegisterPageProps {
  onRegistroExitoso: () => void;
  onVolverALogin: () => void;
}

export default function RegisterPage({
  onRegistroExitoso,
  onVolverALogin,
}: RegisterPageProps) {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarRegistro(evento: FormEvent) {
    evento.preventDefault();
    setError("");
    setMensajeExito("");

    if (!nombreCompleto.trim() || !usuario.trim() || !contrasena) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setCargando(true);
    try {
      const resultado = await registrarUsuario(
        nombreCompleto.trim(),
        usuario.trim(),
        contrasena
      );

      if (resultado.ok) {
        setMensajeExito("¡Cuenta creada exitosamente!");
        setTimeout(() => {
          onRegistroExitoso();
        }, 1500);
      } else {
        setError(resultado.mensaje || "Error al crear la cuenta.");
      }
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-fondo">
      <div className="login-tarjeta">
        <h1 className="login-titulo">Crear Cuenta</h1>
        <p className="login-subtitulo">Regístrate para comprar en K-SHOES</p>

        <form onSubmit={manejarRegistro} noValidate>
          <label className="login-etiqueta" htmlFor="nombreCompleto">
            Nombre Completo:
          </label>
          <input
            id="nombreCompleto"
            className="login-input"
            type="text"
            placeholder="Ej. Juan Pérez"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
          />

          <label className="login-etiqueta" htmlFor="usuario">
            Usuario:
          </label>
          <input
            id="usuario"
            className="login-input"
            type="text"
            placeholder="Elige un nombre de usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <label className="login-etiqueta" htmlFor="contrasena">
            Contraseña:
          </label>
          <input
            id="contrasena"
            className="login-input"
            type="password"
            placeholder="Crea una contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />

          {error && <p className="login-error">{error}</p>}
          {mensajeExito && <p style={{ color: "#22c55e", textAlign: "center", marginTop: "10px" }}>{mensajeExito}</p>}

          <button type="submit" className="login-boton" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <button className="login-enlace-registro" onClick={onVolverALogin}>
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>
    </div>
  );
}