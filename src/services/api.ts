export const API_URL = "http://localhost:3000/api";

// Llama a la API agregando el token de sesión.
// Si algo sale mal, lanza un Error con el mensaje que mandó el servidor.
export async function api<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("kshoes_token");

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. ¿Está encendido el backend?");
  }

  // Si la sesión expiró, se limpia y se vuelve a la pantalla de login.
  if (respuesta.status === 401 && token) {
    localStorage.removeItem("kshoes_token");
    localStorage.removeItem("kshoes_usuario");
    window.location.reload();
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.mensaje ?? "Error del servidor.");
  }
  return datos as T;
}