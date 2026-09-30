import { api } from "./api";

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoriaId: number | null;
  categoria: string | null;
  precio: number;
  costo: number;
  stock: number;
  activo: boolean;
}

// Lo que se envía al crear o editar (el id y el nombre de la categoría los pone el servidor).
export type DatosProducto = Omit<Producto, "id" | "categoria">;

export const listarCategorias = () => api<Categoria[]>("/catalogo/categorias");

// Para el panel de administración (incluye los productos desactivados).
export const listarProductosAdmin = () => api<Producto[]>("/catalogo/productos/todos");

// Para la tienda online (solo productos activos).
export const listarProductosTienda = () => api<Producto[]>("/catalogo/productos");

export const crearProducto = (datos: DatosProducto) =>
  api<{ id: number }>("/catalogo/productos", {
    method: "POST",
    body: JSON.stringify(datos),
  });

export const actualizarProducto = (id: number, datos: DatosProducto) =>
  api<{ mensaje: string }>(`/catalogo/productos/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

export const desactivarProducto = (id: number) =>
  api<{ mensaje: string }>(`/catalogo/productos/${id}`, { method: "DELETE" });