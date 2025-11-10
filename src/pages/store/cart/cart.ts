import { getCart, removeFromCart, updateCartItem, clearCart, calculateCartSummary } from "../../../utils/cart.ts";
import { checkAuthAndRole } from "../../../utils/auth.ts";
import type { ISessionUser } from "../../../types/IUser.ts";

const CART_ITEMS_ID = "cart-items";
const SUBTOTAL_ID = "cart-subtotal";
const TOTAL_ID = "cart-total";
const SHIPPING_ID = "cart-shipping";
const EMPTY_MSG_ID = "empty-cart-message";

document.addEventListener("DOMContentLoaded", async () => {
  const user: ISessionUser | null = checkAuthAndRole("client");
  if (!user) return;
  renderCart();
  setupListeners();
});

function showToast(message: string, type: "success" | "error" = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Renderiza los productos en el carrito
function renderCart(): void {
  const cart = getCart();
  const container = document.getElementById(CART_ITEMS_ID)!;
  const subtotalEl = document.getElementById(SUBTOTAL_ID)!;
  const totalEl = document.getElementById(TOTAL_ID)!;
  const shippingEl = document.getElementById(SHIPPING_ID)!;
  const emptyMsg = document.getElementById(EMPTY_MSG_ID)!;

  if (!cart.items.length) {
    container.innerHTML = "";
    emptyMsg.classList.remove("hidden");
    subtotalEl.textContent = "$0.00";
    totalEl.textContent = "$0.00";
    return;
  }

  emptyMsg.classList.add("hidden");

  container.innerHTML = cart.items
    .map(
      (item) => `
      <div class="cart-item">
        <img src="${item.product.imagenUrl}" alt="${item.product.nombre}" class="cart-item-img">
        <div class="cart-item-info">
          <h4>${item.product.nombre}</h4>
          <p>${item.product.descripcion}</p>
          <p class="price">$${item.product.precio.toFixed(2)} <span class="price-unit">c/u</span></p>
        </div>

        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="qty-btn decrease" data-id="${item.product.id}">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn increase" data-id="${item.product.id}">+</button>
          </div>
          <p class="subtotal">$${(item.product.precio * item.quantity).toFixed(2)}</p>
          <button class="btn-icon remove-btn" data-id="${item.product.id}">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    `
    )
    .join("");

  //Calcula y muestra totales
  const { total } = calculateCartSummary();
  const envio = 500;
  subtotalEl.textContent = `$${total.toFixed(2)}`;
  shippingEl.textContent = `$${envio.toFixed(2)}`;
  totalEl.textContent = `$${(total + envio).toFixed(2)}`;
}

//Configura botones y eventos del carrito
function setupListeners(): void {
  document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const button = target.closest("button"); 

  if (!button) return;
  const id = button.getAttribute("data-id");
  if (!id) return;
  const productId = parseInt(id);

  if (button.classList.contains("increase")) {
    updateCartItem(productId, +1);
    renderCart();
  } else if (button.classList.contains("decrease")) {
    updateCartItem(productId, -1);
    renderCart();
  } else if (button.classList.contains("remove-btn")) {
    removeFromCart(productId);
    renderCart();
    showToast("Producto eliminado del carrito 🗑️", "success");
  }
  });

  const clearBtn = document.getElementById("clear-cart-btn");
  if (clearBtn)
    clearBtn.addEventListener("click", () => {
      if (confirm("¿Vaciar el carrito?")) {
        clearCart();
        renderCart();
        showToast("Carrito vaciado correctamente 🛒", "success");
      }
    });

  const checkoutBtn = document.getElementById("checkout-btn");

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    const cart = getCart();
    if (!cart.items.length) {
      showToast("Tu carrito está vacío 🛒", "error");
      return;
    }

    const modal = document.getElementById("checkout-modal")!;
    const totalText = document.getElementById("checkout-total")!;
    const summary = calculateCartSummary();
    const envio = 500;
    const totalConEnvio = summary.total + envio;
    totalText.textContent = `$${totalConEnvio.toFixed(2)}`;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });
}

//Cerrar modal de checkout
document.getElementById("close-checkout-modal")?.addEventListener("click", closeCheckoutModal);
document.querySelector("#checkout-modal .modal-backdrop")?.addEventListener("click", closeCheckoutModal);
function closeCheckoutModal() {
  const modal = document.getElementById("checkout-modal")!;
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

//Confirmar pedido
document.getElementById("checkout-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const phone = (document.getElementById("checkout-phone") as HTMLInputElement).value.trim();
  const address = (document.getElementById("checkout-address") as HTMLInputElement).value.trim();
  const payment = (document.getElementById("checkout-payment") as HTMLSelectElement).value;
  const notes = (document.getElementById("checkout-notes") as HTMLTextAreaElement).value.trim();

  if (!phone || !address || !payment) {
    showToast("Completá todos los campos obligatorios ✏️", "error");
    return;
  }

  const cart = getCart();

  try {
    const pedidoPayload = {
      usuarioId: 2, 
      telefono: phone,
      direccion: address,
      metodoPago: payment,
      notas: notes,
      items: cart.items.map(i => ({
        productoId: i.product.id,
        cantidad: i.quantity
      }))
    };

    const response = await fetch("http://localhost:8080/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedidoPayload),
    });

    if (!response.ok) throw new Error("Error al procesar el pedido");

    clearCart();
    renderCart();
    closeCheckoutModal();
    showToast("Pedido confirmado con éxito ✅", "success");
    setTimeout(() => {
      window.location.href = "../home/home.html";
    }, 2000);

  } catch (err) {
    console.error(err);
    showToast("No se pudo enviar el pedido ❌", "error");
  }
});
}