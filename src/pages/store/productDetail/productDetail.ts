import { apiGet } from "../../../utils/api.ts";
import { renderSidebar } from "../../../components/Sidebar/sidebar.ts";
import { checkAuthAndRole } from "../../../utils/auth.ts";
import { addToCart } from "../../../utils/cart.ts";
import type { ISessionUser } from "../../../types/IUser.ts";
import type { IProduct } from "../../../types/IProduct.ts";

const PRODUCT_DETAIL_ID = 'product-detail';
const LOADING_MESSAGE_ID = 'loading-message';

document.addEventListener("DOMContentLoaded", async () => {
  const user: ISessionUser | null = checkAuthAndRole(null);
  if (!user) return;

  await renderSidebar(user);

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) {
    showError("No se especificó ningún producto.");
    return;
  }
  await loadProductDetail(parseInt(productId));
});

//Carga y muestra el detalle del producto
async function loadProductDetail(id: number) {
  const container = document.getElementById(PRODUCT_DETAIL_ID);
  const loading = document.getElementById(LOADING_MESSAGE_ID);
  if (!container || !loading) return;

  loading.textContent = "Cargando producto...";

  try {
    const product = await apiGet<IProduct>(`/productos/${id}`);
    loading.style.display = "none";

    const available = product.stock > 0;
    const availabilityBadge = available
      ? `<span class="badge badge-success">Disponible</span>`
      : `<span class="badge badge-danger">No disponible</span>`;

    container.innerHTML = `
      <img src="${product.imagenUrl}" alt="${product.nombre}" class="product-detail-image">

      <div class="product-detail-info">
        <h2>${product.nombre}</h2>
        <p class="product-detail-price">$${product.precio.toFixed(2)}</p>
        ${availabilityBadge}
        <p>${product.descripcion}</p>

        <div class="product-detail-quantity">
          <label for="quantity"><strong>Cantidad:</strong></label>
          <div class="quantity-control">
            <button id="decrease-btn" class="qty-btn">−</button>
            <input type="number" id="quantity" value="1" min="1" max="${product.stock}" readonly>
            <button id="increase-btn" class="qty-btn">+</button>
          </div>
        </div>

        <div class="product-detail-actions">
          <button id="add-to-cart" class="btn-add-cart" ${!available ? 'disabled' : ''}>
            🛒 Agregar al Carrito
          </button>
          <button id="back-btn" class="btn-secondary">← Volver</button>
        </div>
      </div>
    `;

   // Eventos de los botones
    const addBtn = document.getElementById("add-to-cart") as HTMLButtonElement;
    const qtyInput = document.getElementById("quantity") as HTMLInputElement;
    const decreaseBtn = document.getElementById("decrease-btn") as HTMLButtonElement;
    const increaseBtn = document.getElementById("increase-btn") as HTMLButtonElement;
    const backBtn = document.getElementById("back-btn") as HTMLButtonElement;

    // + y - cantidad
    decreaseBtn.addEventListener("click", () => {
      const current = parseInt(qtyInput.value);
      if (current > 1) qtyInput.value = (current - 1).toString();
    });

    increaseBtn.addEventListener("click", () => {
      const current = parseInt(qtyInput.value);
      if (current < product.stock) qtyInput.value = (current + 1).toString();
    });

    // agregar al carrito
    addBtn.addEventListener("click", () => {
        const quantity = parseInt(qtyInput.value);
        if (available && quantity > 0) {
            addToCart(product, quantity);
            document.dispatchEvent(new Event("cartUpdated"));
            showToast(`${product.nombre} x${quantity} agregado al carrito 🛒`, "success");
        } else {
            showToast("No se puede agregar al carrito. Verifica el stock o la cantidad.", "error");
        }
    });

    // volver atrás
    backBtn.addEventListener("click", () => {
      window.history.back();
    });

  } catch (error: any) {
    console.error("Error al cargar el producto:", error);
    showError("No se pudo cargar la información del producto.");
  }
}

// Muestra un mensaje de error en el contenedor principal
function showError(msg: string) {
  const container = document.getElementById(PRODUCT_DETAIL_ID);
  if (container) container.innerHTML = `<p style="color:red;">${msg}</p>`;
}

// Notificación para el usuario
function showToast(message: string, type: "success" | "error" = "success") {
  const toast = document.createElement("div");
  toast.className = `toast-message toast-${type}`;
  toast.innerHTML = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}