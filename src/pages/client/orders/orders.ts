// src/pages/client/orders/orders.ts
import { checkAuthAndRole, logout } from "../../../utils/auth.ts";
import { renderSidebar } from "../../../components/Sidebar/sidebar.ts";
import { apiGet } from "../../../utils/api.ts";
import type { ISessionUser } from "../../../types/IUser.ts";
import type { IOrder } from "../../../types/IOrders.ts";

const ORDERS_CONTAINER_ID = "orders-container";
const LOADING_MESSAGE_ID = "loading-message";

document.addEventListener("DOMContentLoaded", async () => {
  const user: ISessionUser | null = checkAuthAndRole("client");
  if (!user) return;
  console.log(`📦 Página de pedidos cargada para: ${user.name}`);
  await renderSidebar(user);
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) logoutButton.addEventListener("click", logout);
  await loadOrders(user.id);
});

// Carga los pedidos del usuario desde el backend
async function loadOrders(userId: number): Promise<void> {
  const container = document.getElementById(ORDERS_CONTAINER_ID);
  const loadingMessage = document.getElementById(LOADING_MESSAGE_ID);

  if (!container || !loadingMessage) return;

  container.innerHTML = "";
  loadingMessage.textContent = "Cargando tus pedidos...";
  loadingMessage.style.display = "block";

  try {
    const orders = await apiGet<IOrder[]>(`/pedidos?usuarioId=${userId}`);

    if (orders.length === 0) {
      loadingMessage.textContent = "Aún no realizaste ningún pedido 🍕";
      return;
    }

    loadingMessage.style.display = "none";
    renderOrdersList(orders, container);

  } catch (error) {
    console.error("❌ Error al cargar pedidos:", error);
    loadingMessage.textContent = "Error al conectar con el servidor.";
  }
}

//Listado de pedidos
function renderOrdersList(orders: IOrder[], container: HTMLElement): void {
  const cardsHTML = orders.map(order => renderOrderCard(order)).join("");
  container.innerHTML = cardsHTML;
}

// Tarjeta individual de pedido
function renderOrderCard(order: IOrder): string {
  const date = new Date(order.fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const estadoColor =
    order.estado === "confirmado" ? "badge-success" :
    order.estado === "pendiente" ? "badge-warning" :
    order.estado === "cancelado" ? "badge-danger" : "badge-secondary";

  const envio = 500;
  const totalConEnvio = order.total + envio;

  const total = totalConEnvio.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

  const productosHTML = order.detallesPedido
    ?.map(item => `• ${item.productoNombre} (x${item.cantidad})`)
    .join("<br>") || "Sin productos";

  const totalItems = order.detallesPedido?.length || 0;

  return `
    <div class="order-card">
      <div class="order-header">
        <div>
          <p class="order-id">Pedido #ORD-${order.id}</p>
          <p class="order-date">
            <span class="material-symbols-outlined icon-clock">schedule</span> 
            ${date}
          </p>
        </div>
        <span class="badge ${estadoColor}">${order.estado}</span>
      </div>

      <div class="order-body">
        <div class="order-products">
          ${productosHTML}
        </div>

        <div class="order-footer">
          <p class="order-items">
            <span class="material-symbols-outlined icon-box">inventory_2</span>
            ${totalItems} producto(s)
          </p>
          <p class="order-total">${total}</p>
        </div>
      </div>

      <div class="order-actions">
        <button class="btn btn-secondary" data-id="${order.id}">
          Ver detalle
        </button>
      </div>
    </div>
  `;
}

//Evento para ver detalle del pedido
document.addEventListener("click", async (e) => {
  const target = e.target as HTMLElement;
  if (target.matches(".order-actions button")) {
    const orderId = target.getAttribute("data-id");
    if (!orderId) return;

    try {
      const order = await apiGet<IOrder>(`/pedidos/${orderId}`);
      renderOrderDetailModal(order);
    } catch (error) {
      console.error("❌ Error al cargar detalle del pedido:", error);
      showFloatingMessage("Error al cargar el detalle del pedido", "error");
    }
  }
});

//Renderiza el modal con detalle del pedido
function renderOrderDetailModal(order: IOrder): void {
  const modal = document.getElementById("order-detail-modal");
  if (!modal) return;

  const fecha = new Date(order.fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const envio = 500;
  const totalConEnvio = order.total + envio;
  const total = totalConEnvio.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

  const productosHTML = order.detallesPedido
    .map(
      (p) => `
        <div class="detalle-producto">
          <div class="detalle-info">
            <p class="nombre">${p.productoNombre}</p>
            <p class="cantidad">Cantidad: ${p.cantidad} x $${p.precioUnitario.toFixed(2)}</p>
          </div>
          <p class="precio">$${p.subtotal.toFixed(2)}</p>
        </div>
      `
    )
    .join("");

  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-dialog pedido-detalle-modal">
      <button class="modal-close-btn">&times;</button>

      <div class="detalle-estado">
        <span class="badge badge-warning">${order.estado.toUpperCase()}</span>
        <p class="detalle-fecha">
          <span class="material-symbols-outlined icon-calendar">calendar_month</span>
          ${fecha}
        </p>
      </div>

      <div class="detalle-seccion info-entrega">
        <h4><span class="material-symbols-outlined icon-location">location_on</span> Información de Entrega</h4>
        <p><b>Dirección:</b> ${order.direccion}</p>
        <p><b>Teléfono:</b> ${order.telefono}</p>
        <p><b>Método de pago:</b> ${order.metodoPago}</p>
      </div>

      <div class="detalle-seccion productos">
        <h4><span class="material-symbols-outlined icon-burger">lunch_dining</span> Productos</h4>
        <div class="productos-lista">${productosHTML}</div>

        <div class="totales">
          <p>Subtotal: $${order.total.toFixed(2)}</p>
          <p>Envío: $${envio.toFixed(2)}</p>
          <hr class="linea-total"/>
          <p class="total-final"><b>Total:</b> <span>${total}</span></p>
        </div>
      </div>

      <div class="detalle-estado-final">
        <span class="material-symbols-outlined icon-clock">schedule</span>
        <div>
          <p class="titulo">Tu pedido está siendo procesado</p>
          <p class="subtitulo">Te notificaremos cuando esté listo para entrega.</p>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");

  
  const backdrop = modal.querySelector(".modal-backdrop");
  const closeBtn = modal.querySelector(".modal-close-btn");
  if (backdrop) backdrop.addEventListener("click", closeOrderModal);
  if (closeBtn) closeBtn.addEventListener("click", closeOrderModal);
}

//Cerrar modal de detalle de pedido
function closeOrderModal(): void {
  const modal = document.getElementById("order-detail-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.innerHTML = "";
}

//Muestra un mensaje flotante
function showFloatingMessage(message: string, type: "success" | "error"): void {
  const msg = document.createElement("div");
  msg.textContent = message;
  msg.className = `floating-msg ${type}`;
  document.body.appendChild(msg);

  setTimeout(() => msg.classList.add("show"), 10);
  setTimeout(() => {
    msg.classList.remove("show");
    msg.remove();
  }, 2500);
}

