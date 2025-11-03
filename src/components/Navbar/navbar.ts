import { getSession, logout } from "../../utils/auth";
import { calculateCartSummary } from "../../utils/cart";
import type { ISessionUser } from "../../types/IUser";

const NAVBAR_CONTAINER_ID = "navbar-container";
const CART_BADGE_ID = "cart-badge";
const LOGOUT_BUTTON_ID = "logout-button";

/**
 * Renderiza la barra de navegación en el DOM de forma dinámica.
 * Muestra links de admin o cliente, e inicializa el contador de carrito.
 */
export function renderNavbar(): void {
  const container = document.getElementById(NAVBAR_CONTAINER_ID);
  if (!container) return;

  //Obtenemos el usuario de sesión y el resumen del carrito

  const user: ISessionUser | null = getSession();
  const summary = calculateCartSummary();
  const cartCount = summary.itemCount;

  // Links base de la tienda (visible para todos los usuarios)

  let linksHTML = `<a href="../../store/home/home.html">Tienda</a>`;

  // Variables que se completan según el tipo de usuario

  let userAreaHTML = "";
  let cartHTML = "";

  // Enlaces específicos por rol

  if (user) {

    if (user.role === "admin") {
      linksHTML += `<a href="../../admin/adminHome/adminHome.html">Panel Admin</a>`;
    } else if (user.role === "client") {
      linksHTML += `<a href="../../client/orders/orders.html">Mis Pedidos</a>`;

      // Mostrar el carrito solo si es cliente

      cartHTML = `
        <a href="../../store/cart/cart.html" class="nav-cart-link">
          Carrito (<span id="${CART_BADGE_ID}">${cartCount}</span>)
        </a>
      `;
    }

    // Nombre de usuario y botón de logout

    userAreaHTML = `
      ${cartHTML}
      <span class="user-name">${user.name}</span>
      <button id="${LOGOUT_BUTTON_ID}" class="btn btn-sm btn-logout">Cerrar Sesión</button>
    `;
  }

  // Inserción del HTML en el contenedor del navbar

  container.innerHTML = `
  <div class="navbar-left">
    <div class="navbar-logo">
      <a href="${
        user?.role === "admin"
          ? "../../admin/adminHome/adminHome.html"
          : "../../store/home/home.html"
      }">
        <span class="material-symbols-outlined">local_pizza</span>
        Food Store
      </a>
    </div>
  </div>

  <div class="navbar-right">
    <div class="navbar-links">
      ${linksHTML}
    </div>
    <div class="navbar-user-area">
      ${userAreaHTML}
    </div>
  </div>
`;

  // Listener de logout
  const logoutBtn = document.getElementById(LOGOUT_BUTTON_ID);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // Listener para actualizar el carrito
  document.addEventListener("cartUpdated", updateCartBadge);
}

/* Actualiza solo el contador del carrito (sin volver a renderizar todo el navbar) */

function updateCartBadge(): void {
  const badge = document.getElementById(CART_BADGE_ID);
  const user = getSession();
  if (badge && user?.role === "client") {
    const summary = calculateCartSummary();
    badge.textContent = summary.itemCount.toString();
  }
}

// Inicializa el Navbar al cargar la página
document.addEventListener("DOMContentLoaded", renderNavbar);
