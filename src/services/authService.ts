// Servicio de autenticación del frontend.
// Habla con la API del backend (que guarda los usuarios en MySQL).

const API_URL = "http://localhost:3000/api";

export type Rol = "cliente" | "administrador" | "contador";

export interface UsuarioSesion {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  rol: Rol;
}

interface ResultadoRegistro {
  ok: boolean;
  mensaje?: string;
}

// Devuelve true si entró, false si el usuario o la contraseña son incorrectos.
// Si no se puede hablar con el servidor lanza un error (LoginPage lo muestra).
export async function iniciarSesion(
  usuario: string,
  contrasena: string
): Promise<boolean> {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, contrasena }),
  });

  if (respuesta.status === 400 || respuesta.status === 401) {
    return false;
  }
  if (!respuesta.ok) {
    throw new Error("Error del servidor");
  }

  const datos = await respuesta.json();
  localStorage.setItem("kshoes_token", datos.token);
  localStorage.setItem("kshoes_usuario", JSON.stringify(datos.usuario));
  return true;
}

// Crea una cuenta de cliente.
export async function registrarUsuario(
  nombreCompleto: string,
  usuario: string,
  contrasena: string
): Promise<ResultadoRegistro> {
  const respuesta = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombreCompleto, usuario, contrasena }),
  });

  const datos = await respuesta.json().catch(() => ({}));
  return { ok: respuesta.ok, mensaje: datos.mensaje };
}

// Quién tiene la sesión abierta (o null si nadie).
export function obtenerUsuarioActual(): UsuarioSesion | null {
  const guardado = localStorage.getItem("kshoes_usuario");
  return guardado ? (JSON.parse(guardado) as UsuarioSesion) : null;
}

export function cerrarSesion(): void {
  localStorage.removeItem("kshoes_token");
  localStorage.removeItem("kshoes_usuario");
}
