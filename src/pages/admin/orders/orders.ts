import { checkAuthAndRole, logout } from "../../../utils/auth.ts";
import { renderSidebar } from "../../../components/Sidebar/sidebar.ts";
import { apiGet, apiRequest } from "../../../utils/api.ts";
import type { IOrder } from "../../../types/IOrders.ts";

document.addEventListener("DOMContentLoaded", async () => {
  const user = checkAuthAndRole("admin");
  if (!user) return;

  await renderSidebar(user);
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) logoutButton.addEventListener("click", logout);

  loadOrders();
});

/* Cargar lista de pedidos */

async function loadOrders(): Promise<void> {
  const container = document.getElementById("orders-container")!;
  const loading = document.getElementById("loading-message")!;
  container.innerHTML = "";
  loading.textContent = "Cargando pedidos...";

  try {
    const orders = await apiGet<IOrder[]>("/pedidos");

    if (!orders.length) {
      loading.textContent = "No hay pedidos registrados aún.";
      return;
    }

    loading.style.display = "none";
    renderOrdersList(orders, container);
  } catch (error) {
    console.error("❌ Error al cargar pedidos:", error);
    loading.textContent = "Error al conectar con el servidor.";
  }
}

/* Renderizar lista de tarjetas */

function renderOrdersList(orders: IOrder[], container: HTMLElement): void {
  const html = orders.map((o) => renderOrderCard(o)).join("");
  container.innerHTML = html;
}

/* Tarjeta individual de pedido */

function renderOrderCard(order: IOrder): string {
  const date = new Date(order.fecha).toLocaleString("es-AR");
  const total = (order.total + 500).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

  const estadoColor =
    order.estado === "confirmado"
      ? "badge-success"
      : order.estado === "pendiente"
      ? "badge-warning"
      : order.estado === "cancelado"
      ? "badge-danger"
      : "badge-secondary";

  return `
    <div class="order-card">
      <div class="order-header">
        <div>
          <p class="order-id">Pedido #ORD-${order.id}</p>
          <p>${date}</p>
          <p>Cliente: ${order.usuario?.nombre || "Desconocido"}</p>
        </div>
        <span class="badge ${estadoColor}">${order.estado}</span>
      </div>
      <p>${order.detallesPedido?.length || 0} producto(s)</p>
      <div class="order-footer">
        <p class="order-total">${total}</p>
      </div>
      <div class="order-actions">
        <button class="btn btn-secondary" data-id="${order.id}">
          Ver detalle
        </button>
      </div>
    </div>
  `;
}

/* Click en "ver detalle" */

document.addEventListener("click", async (e) => {
  const target = e.target as HTMLElement;
  if (target.matches(".order-actions button")) {
    const id = target.getAttribute("data-id");
    if (!id) return;
    try {
      const order = await apiGet<IOrder>(`/pedidos/${id}`);
      renderOrderDetailModal(order);
    } catch (err) {
      console.error("Error al obtener detalle:", err);
      showFloatingMessage("No se pudo cargar el detalle del pedido", "error");
    }
  }
});

/* Renderizar modal de detalle */

function renderOrderDetailModal(order: IOrder): void {
  const modal = document.getElementById("order-detail-modal")!;
  const fecha = new Date(order.fecha).toLocaleString("es-AR");
  const total = (order.total + 500).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

  const productosHTML = order.detallesPedido
    ?.map(
      (p) => `
      <div class="order-product">
        <span>${p.producto?.nombre || "Producto desconocido"}</span>
        <span>x${p.cantidad}</span>
        <span>$${p.subtotal.toFixed(2)}</span>
      </div>`
    )
  .join("") || "<p>Sin productos</p>";

  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-dialog">
      <button class="modal-close-btn">&times;</button>
      <h3>Detalle del Pedido #ORD-${order.id}</h3>
      <p><b>Cliente:</b> ${order.usuario?.nombre || "Desconocido"}</p>
      <p><b>Fecha:</b> ${fecha}</p>
      <p><b>Teléfono:</b> ${order.telefono}</p>
      <p><b>Dirección:</b> ${order.direccion}</p>
      <p><b>Método de pago:</b> ${order.metodoPago}</p>
      <h4>Productos:</h4>
      ${productosHTML}
      <div class="order-summary">
        <p>Subtotal: $${order.total.toFixed(2)}</p>
        <p>Envío: $500.00</p>
        <hr class="linea-total">
        <p class="order-total-final">Total: ${total}</p>
      </div>
      <div style="margin-top:15px;">
        <label><b>Cambiar Estado:</b></label>
        <select id="estado-select">
          <option value="pendiente" ${order.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="confirmado" ${order.estado === "confirmado" ? "selected" : ""}>Confirmado</option>
          <option value="terminado" ${order.estado === "terminado" ? "selected" : ""}>Terminado</option>
          <option value="cancelado" ${order.estado === "cancelado" ? "selected" : ""}>Cancelado</option>
        </select>
      </div>
      <button id="update-status-btn" class="btn btn-primary" style="margin-top:10px;">Actualizar Estado</button>
    </div>
  `;

  modal.classList.remove("hidden");

  modal.querySelector(".modal-backdrop")?.addEventListener("click", closeModal);
  modal.querySelector(".modal-close-btn")?.addEventListener("click", closeModal);

  // actualizar estado
  modal.querySelector("#update-status-btn")?.addEventListener("click", async () => {
    const nuevoEstado = (document.getElementById("estado-select") as HTMLSelectElement).value;

    try {
      await apiRequest(`/pedidos/${order.id}/estado?estado=${nuevoEstado}`, "PUT");
      showFloatingMessage("Estado actualizado con éxito", "success");
      closeModal();
      loadOrders();
    } catch {
      showFloatingMessage("Error al actualizar el estado", "error");
    }
  });
}

/* Cerrar modal */

function closeModal() {
  const modal = document.getElementById("order-detail-modal")!;
  modal.classList.add("hidden");
  modal.innerHTML = "";
}

/* Mensaje flotante toast */

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
