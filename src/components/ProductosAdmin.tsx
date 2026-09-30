import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  actualizarProducto,
  crearProducto,
  desactivarProducto,
  listarCategorias,
  listarProductosAdmin,
} from "../services/catalogoService";
import type { Categoria, DatosProducto, Producto } from "../services/catalogoService";

interface ProductosAdminProps {
  puedeEditar: boolean;
}

// Los campos del formulario son texto para poder escribir libremente;
// se convierten a número al guardar.
interface FormularioProducto {
  id: number | null;
  sku: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  precio: string;
  costo: string;
  stock: string;
  activo: boolean;
}

const FORMULARIO_VACIO: FormularioProducto = {
  id: null,
  sku: "",
  nombre: "",
  descripcion: "",
  categoriaId: "",
  precio: "",
  costo: "0",
  stock: "0",
  activo: true,
};

const STOCK_BAJO = 5;

function mensajeDe(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error.";
}

function estadoDe(p: Producto): { clase: string; texto: string } {
  if (!p.activo) return { clase: "inactivo", texto: "Inactivo" };
  if (p.stock === 0) return { clase: "agotado", texto: "Agotado" };
  if (p.stock <= STOCK_BAJO) return { clase: "bajo", texto: "Poco stock" };
  return { clase: "ok", texto: "Disponible" };
}

export default function ProductosAdmin({ puedeEditar }: ProductosAdminProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [formulario, setFormulario] = useState<FormularioProducto | null>(null);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setError("");
    try {
      const [listaProductos, listaCategorias] = await Promise.all([
        listarProductosAdmin(),
        listarCategorias(),
      ]);
      setProductos(listaProductos);
      setCategorias(listaCategorias);
    } catch (e) {
      setError(mensajeDe(e));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return productos;
    return productos.filter(
      (p) => p.nombre.toLowerCase().includes(texto) || p.sku.toLowerCase().includes(texto)
    );
  }, [productos, busqueda]);

  const activos = productos.filter((p) => p.activo).length;
  const pocoStock = productos.filter((p) => p.activo && p.stock > 0 && p.stock <= STOCK_BAJO).length;
  const agotados = productos.filter((p) => p.activo && p.stock === 0).length;

  function cambiar<K extends keyof FormularioProducto>(campo: K, valor: FormularioProducto[K]) {
    setFormulario((f) => (f ? { ...f, [campo]: valor } : f));
  }

  function abrirNuevo() {
    setErrorFormulario("");
    setFormulario({ ...FORMULARIO_VACIO });
  }

  function abrirEditar(p: Producto) {
    setErrorFormulario("");
    setFormulario({
      id: p.id,
      sku: p.sku,
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      categoriaId: p.categoriaId ? String(p.categoriaId) : "",
      precio: String(p.precio),
      costo: String(p.costo),
      stock: String(p.stock),
      activo: p.activo,
    });
  }

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    if (!formulario) return;
    setErrorFormulario("");

    const datos: DatosProducto = {
      sku: formulario.sku.trim(),
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
      categoriaId: formulario.categoriaId ? Number(formulario.categoriaId) : null,
      precio: Number(formulario.precio),
      costo: Number(formulario.costo),
      stock: Number(formulario.stock),
      activo: formulario.activo,
    };

    if (!datos.sku || !datos.nombre) {
      setErrorFormulario("El código (SKU) y el nombre son obligatorios.");
      return;
    }
    if (formulario.precio.trim() === "" || Number.isNaN(datos.precio) || datos.precio < 0) {
      setErrorFormulario("Escribe un precio válido (0 o más).");
      return;
    }
    if (Number.isNaN(datos.costo) || datos.costo < 0) {
      setErrorFormulario("Escribe un costo válido (0 o más).");
      return;
    }
    if (!Number.isInteger(datos.stock) || datos.stock < 0) {
      setErrorFormulario("El stock debe ser un número entero (0 o más).");
      return;
    }

    setGuardando(true);
    try {
      if (formulario.id === null) {
        await crearProducto(datos);
      } else {
        await actualizarProducto(formulario.id, datos);
      }
      setFormulario(null);
      await cargar();
    } catch (e) {
      setErrorFormulario(mensajeDe(e));
    } finally {
      setGuardando(false);
    }
  }

  async function desactivar(p: Producto) {
    if (!window.confirm(`¿Desactivar "${p.nombre}"? Dejará de aparecer en la tienda.`)) return;
    try {
      await desactivarProducto(p.id);
      await cargar();
    } catch (e) {
      setError(mensajeDe(e));
    }
  }

  return (
    <section>
      <div className="seccion-titulo">
        <h2>Productos y stock</h2>
        {puedeEditar && (
          <button className="btn btn-primario" onClick={abrirNuevo}>
            + Nuevo producto
          </button>
        )}
      </div>

      <div className="resumen">
        <div className="resumen-item">
          <strong>{activos}</strong>
          <span>Productos activos</span>
        </div>
        <div className="resumen-item">
          <strong>{pocoStock}</strong>
          <span>Con poco stock ({STOCK_BAJO} o menos)</span>
        </div>
        <div className="resumen-item">
          <strong>{agotados}</strong>
          <span>Agotados</span>
        </div>
      </div>

      <div className="herramientas">
        <input
          className="campo-busqueda"
          type="search"
          placeholder="Buscar por nombre o SKU"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      <div className="tabla-caja">
        {cargando ? (
          <p className="vacio">Cargando productos...</p>
        ) : visibles.length === 0 ? (
          <p className="vacio">
            {productos.length === 0
              ? "Todavía no hay productos. Crea el primero con «Nuevo producto»."
              : "No hay productos que coincidan con la búsqueda."}
          </p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th className="num">Precio</th>
                <th className="num">Costo</th>
                <th className="num">Stock</th>
                <th>Estado</th>
                {puedeEditar && <th></th>}
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => {
                const estado = estadoDe(p);
                return (
                  <tr key={p.id}>
                    <td>{p.sku}</td>
                    <td>
                      {p.nombre}
                      <div className="sub">{p.categoria ?? "Sin categoría"}</div>
                    </td>
                    <td className="num">{p.precio.toFixed(2)}</td>
                    <td className="num">{p.costo.toFixed(2)}</td>
                    <td className="num">{p.stock}</td>
                    <td>
                      <span className={`insignia ${estado.clase}`}>{estado.texto}</span>
                    </td>
                    {puedeEditar && (
                      <td>
                        <div className="acciones">
                          <button className="btn btn-secundario btn-chico" onClick={() => abrirEditar(p)}>
                            Editar
                          </button>
                          {p.activo && (
                            <button className="btn btn-peligro btn-chico" onClick={() => desactivar(p)}>
                              Desactivar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {formulario && (
        <div className="modal-fondo">
          <form className="modal" onSubmit={guardar} noValidate>
            <h3>{formulario.id === null ? "Nuevo producto" : "Editar producto"}</h3>

            <div className="form-grid">
              <div className="campo">
                <label htmlFor="sku">Código (SKU)</label>
                <input id="sku" value={formulario.sku} onChange={(e) => cambiar("sku", e.target.value)} />
              </div>

              <div className="campo">
                <label htmlFor="categoria">Categoría</label>
                <select
                  id="categoria"
                  value={formulario.categoriaId}
                  onChange={(e) => cambiar("categoriaId", e.target.value)}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo ancho">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" value={formulario.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
              </div>

              <div className="campo ancho">
                <label htmlFor="descripcion">Descripción (opcional)</label>
                <textarea
                  id="descripcion"
                  rows={2}
                  value={formulario.descripcion}
                  onChange={(e) => cambiar("descripcion", e.target.value)}
                />
              </div>

              <div className="campo">
                <label htmlFor="precio">Precio de venta</label>
                <input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.precio}
                  onChange={(e) => cambiar("precio", e.target.value)}
                />
              </div>

              <div className="campo">
                <label htmlFor="costo">Costo</label>
                <input
                  id="costo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.costo}
                  onChange={(e) => cambiar("costo", e.target.value)}
                />
              </div>

              <div className="campo">
                <label htmlFor="stock">Stock</label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formulario.stock}
                  onChange={(e) => cambiar("stock", e.target.value)}
                />
              </div>

              <div className="campo campo-check">
                <input
                  id="activo"
                  type="checkbox"
                  checked={formulario.activo}
                  onChange={(e) => cambiar("activo", e.target.checked)}
                />
                <label htmlFor="activo">Producto activo (visible en la tienda)</label>
              </div>
            </div>

            {errorFormulario && <p className="mensaje-error">{errorFormulario}</p>}

            <div className="modal-botones">
              <button type="button" className="btn btn-secundario" onClick={() => setFormulario(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primario" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}