import { useState, type FormEvent } from "react";
import type { ItemCarrito } from "../App";
import "./CarritoModal.css";

interface CarritoModalProps {
  abierto: boolean;
  onCerrar: () => void;
  carrito: ItemCarrito[];
  onCambiarCantidad: (id: number, delta: number) => void;
  onEliminarProducto: (id: number) => void;
  onVaciarCarrito: () => void;
  nombreCliente?: string;
}

interface DatosRecibo {
  folio: string;
  fecha: string;
  titular: string;
  tarjetaEnmascarada: string;
  items: ItemCarrito[];
  total: number;
}

// Algoritmo de Luhn para validar número de tarjeta
function validarLuhn(numeroTarjeta: string): boolean {
  const digitos = numeroTarjeta.replace(/\D/g, "");
  if (digitos.length < 13 || digitos.length > 19) return false;

  let suma = 0;
  let esPar = false;

  for (let i = digitos.length - 1; i >= 0; i--) {
    let d = parseInt(digitos.charAt(i), 10);
    if (esPar) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
    esPar = !esPar;
  }

  return suma % 10 === 0;
}

// Detecta emisor de la tarjeta
function detectarMarcaTarjeta(numero: string): string {
  const num = numero.replace(/\D/g, "");
  if (/^4/.test(num)) return "Visa 💳";
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[0-1]\d|2720)/.test(num)) return "Mastercard 💳";
  if (/^3[47]/.test(num)) return "American Express 💳";
  if (/^6(?:011|5[0-9]{2})/.test(num)) return "Discover 💳";
  if (num.length > 0) return "Desconocida ❓";
  return "";
}

export default function CarritoModal({
  abierto,
  onCerrar,
  carrito,
  onCambiarCantidad,
  onEliminarProducto,
  onVaciarCarrito,
  nombreCliente = "Cliente",
}: CarritoModalProps) {
  const [paso, setPaso] = useState<"carrito" | "pago" | "recibo">("carrito");
  
  // Formulario Pago
  const [nombreTitular, setNombreTitular] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [expiracion, setExpiracion] = useState("");
  const [cvv, setCvv] = useState("");
  const [errorPago, setErrorPago] = useState("");

  // Datos del recibo final
  const [recibo, setRecibo] = useState<DatosRecibo | null>(null);

  if (!abierto) return null;

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const marcaTarjeta = detectarMarcaTarjeta(numeroTarjeta);

  const procesarPago = (e: FormEvent) => {
    e.preventDefault();
    setErrorPago("");

    const numLimpio = numeroTarjeta.replace(/\D/g, "");

    if (!nombreTitular.trim()) {
      setErrorPago("Ingresa el nombre del titular de la tarjeta.");
      return;
    }

    if (!validarLuhn(numLimpio)) {
      setErrorPago("Número de tarjeta inválido. Por favor verifica los datos.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiracion)) {
      setErrorPago("Fecha de expiración inválida (Formato: MM/AA).");
      return;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      setErrorPago("Código CVV inválido (3 o 4 dígitos).");
      return;
    }

    // Generar datos del recibo
    const nuevoRecibo: DatosRecibo = {
      folio: "KS-" + Math.floor(100000 + Math.random() * 900000),
      fecha: new Date().toLocaleString("es-GT"),
      titular: nombreTitular.trim(),
      tarjetaEnmascarada: "**** **** **** " + numLimpio.slice(-4),
      items: [...carrito],
      total: total,
    };

    setRecibo(nuevoRecibo);
    setPaso("recibo");
    onVaciarCarrito();
  };

  const imprimirRecibo = () => {
    window.print();
  };

  const cerrarTodo = () => {
    setPaso("carrito");
    setRecibo(null);
    setNombreTitular("");
    setNumeroTarjeta("");
    setExpiracion("");
    setCvv("");
    onCerrar();
  };

  return (
    <div className="modal-overlay" onClick={cerrarTodo}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-encabezado">
          <h2>
            {paso === "carrito" && "🛒 Tu Carrito de Compras"}
            {paso === "pago" && "💳 Realizar Pago"}
            {paso === "recibo" && "🧾 Recibo de Compra"}
          </h2>
          <button className="btn-cerrar" onClick={cerrarTodo}>✕</button>
        </div>

        {/* 1. VISTA DEL CARRITO */}
        {paso === "carrito" && (
          <>
            <div className="lista-items">
              {carrito.length === 0 ? (
                <p className="carrito-vacio">El carrito está vacío.</p>
              ) : (
                carrito.map((item) => (
                  <div key={item.id} className="item-carrito">
                    <div className="item-info">
                      <h4>{item.nombre}</h4>
                      <span>Q{item.precio.toLocaleString()}</span>
                    </div>
                    <div className="item-controles">
                      <button onClick={() => onCambiarCantidad(item.id, -1)}>-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => onCambiarCantidad(item.id, 1)}>+</button>
                      <button className="btn-eliminar" onClick={() => onEliminarProducto(item.id)}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {carrito.length > 0 && (
              <div className="resumen-compra">
                <div className="total-fila">
                  <strong>Total:</strong>
                  <strong>Q{total.toLocaleString()}</strong>
                </div>
                <button className="btn-pagar" onClick={() => setPaso("pago")}>
                  Proceder al Pago
                </button>
              </div>
            )}
          </>
        )}

        {/* 2. FORMULARIO DE PAGO */}
        {paso === "pago" && (
          <form className="form-pago" onSubmit={procesarPago}>
            <label>Nombre en la tarjeta:</label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              value={nombreTitular}
              onChange={(e) => setNombreTitular(e.target.value)}
              required
            />

            <label>Número de Tarjeta {marcaTarjeta && <span className="marca-tarjeta">({marcaTarjeta})</span>}:</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={numeroTarjeta}
              onChange={(e) => setNumeroTarjeta(e.target.value)}
              required
            />

            <div className="form-grupo-doble">
              <div>
                <label>Expiración (MM/AA):</label>
                <input
                  type="text"
                  placeholder="12/28"
                  maxLength={5}
                  value={expiracion}
                  onChange={(e) => setExpiracion(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>CVV:</label>
                <input
                  type="password"
                  placeholder="123"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </div>
            </div>

            {errorPago && <p className="error-pago">{errorPago}</p>}

            <div className="botones-pago">
              <button type="button" className="btn-volver" onClick={() => setPaso("carrito")}>
                Volver
              </button>
              <button type="submit" className="btn-confirmar-pago">
                Pagar Q{total.toLocaleString()}
              </button>
            </div>
          </form>
        )}

        {/* 3. VISTA DEL RECIBO */}
        {paso === "recibo" && recibo && (
          <div className="recibo-contenedor" id="recibo-imprimir">
            <div className="recibo-encabezado">
              <h3>K-SHOES STORE</h3>
              <p>Comprobante de Pago Exitoso</p>
              <span className="recibo-folio">Folio: {recibo.folio}</span>
            </div>

            <div className="recibo-detalles-cliente">
              <p><strong>Fecha:</strong> {recibo.fecha}</p>
              <p><strong>Cliente:</strong> {nombreCliente}</p>
              <p><strong>Titular Tarjeta:</strong> {recibo.titular}</p>
              <p><strong>Pago con:</strong> {recibo.tarjetaEnmascarada}</p>
            </div>

            <div className="recibo-tabla">
              <div className="recibo-tabla-header">
                <span>Producto</span>
                <span>Cant.</span>
                <span>Precio</span>
              </div>
              {recibo.items.map((it) => (
                <div key={it.id} className="recibo-tabla-fila">
                  <span>{it.nombre}</span>
                  <span>{it.cantidad}</span>
                  <span>Q{(it.precio * it.cantidad).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="recibo-total">
              <strong>TOTAL PAGADO:</strong>
              <strong className="monto-total">Q{recibo.total.toLocaleString()}</strong>
            </div>

            <p className="recibo-gracias">¡Gracias por tu compra en K-SHOES! 👟</p>

            <div className="recibo-acciones">
              <button className="btn-imprimir" onClick={imprimirRecibo}>
                🖨️ Imprimir / Guardar PDF
              </button>
              <button className="btn-finalizar" onClick={cerrarTodo}>
                Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}