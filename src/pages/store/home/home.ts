import { checkAuthAndRole, logout } from "../../../utils/auth.ts";
import type { ISessionUser } from "../../../types/IUser.ts";
import { renderSidebar } from "../../../components/Sidebar/sidebar.ts";
import { apiGet } from "../../../utils/api.ts";
import type { IProduct } from "../../../types/IProduct.ts";

const PRODUCT_GRID_ID = 'product-grid';
const LOADING_MESSAGE_ID = 'loading-message';
const PRODUCT_COUNT_ID = 'product-count';
const SEARCH_INPUT_ID = 'product-search';
const SORT_SELECT_ID = 'product-sort';

let currentFilters = {
  categoryId: 'all',
  searchQuery: '',
  sortOrder: 'default'
};

let allProducts: IProduct[] = [];

//Iniciamos la página
document.addEventListener('DOMContentLoaded', async () => {
  const user: ISessionUser | null = checkAuthAndRole("client"); 
  if (!user) return;

  await renderSidebar(user);

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) logoutButton.addEventListener('click', logout);

  setupEventListeners();
  await loadProducts();
});

//Configuración de listeners para filtros y búsqueda
function setupEventListeners(): void {
  const searchInput = document.getElementById(SEARCH_INPUT_ID);
  const sortSelect = document.getElementById(SORT_SELECT_ID);
  const sidebarContainer = document.getElementById('sidebar-container');
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentFilters.searchQuery = (searchInput as HTMLInputElement).value.trim();
      filterAndRenderProducts(); 
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilters.sortOrder = (sortSelect as HTMLSelectElement).value;
      filterAndRenderProducts(); 
    });
  }

  if (sidebarContainer) {
    sidebarContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('sidebar-category-link')) {
        e.preventDefault();
        currentFilters.categoryId = target.getAttribute('data-id') || 'all';
        document.querySelectorAll('.sidebar-category-link').forEach(link => link.classList.remove('active'));
        target.classList.add('active');
        filterAndRenderProducts(); 
      }
    });
  }
}

//Carga los productos dessde el backend
async function loadProducts() {
  const grid = document.getElementById(PRODUCT_GRID_ID);
  const loading = document.getElementById(LOADING_MESSAGE_ID);
  if (!grid || !loading) return;

  loading.textContent = 'Cargando productos...';
  loading.style.display = 'block';

  try {
    allProducts = await apiGet<IProduct[]>('/productos?disponible=true');
    loading.style.display = 'none';
    filterAndRenderProducts();
  } catch (error) {
    console.error("Error al cargar productos:", error);
    loading.textContent = 'Error al conectar con el servidor de productos.';
  }
}

//Filtra y renderiza los productos según los filtros actuales
function filterAndRenderProducts() {
  let filtered = [...allProducts];

  // Filtro por categoría
  if (currentFilters.categoryId !== 'all') {
    const catId = parseInt(currentFilters.categoryId);
    filtered = filtered.filter(p => p.categoriaId === catId);
  }

  // Filtro por texto
  if (currentFilters.searchQuery) {
    const query = currentFilters.searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.nombre.toLowerCase().includes(query) ||
      p.descripcion.toLowerCase().includes(query)
    );
  }

  // Ordenamiento
  switch (currentFilters.sortOrder) {
    case "name_asc":
      filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case "name_desc":
      filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
      break;
    case "price_asc":
      filtered.sort((a, b) => a.precio - b.precio);
      break;
    case "price_desc":
      filtered.sort((a, b) => b.precio - a.precio);
      break;
  }

  renderProducts(filtered);
}

//Renderiza los productos 
function renderProducts(products: IProduct[]) {
  const grid = document.getElementById(PRODUCT_GRID_ID);
  const countDisplay = document.getElementById(PRODUCT_COUNT_ID);
  if (!grid || !countDisplay) return;

  if (products.length === 0) {
    grid.innerHTML = `<p class="error-text">No se encontraron productos.</p>`;
  } else {
    grid.innerHTML = products.map(renderProductCard).join('');
  }

  countDisplay.textContent = `${products.length} producto${products.length !== 1 ? 's' : ''}`;
  setupDetailNavigation();
}

//Tarjeta HTML de un producto
function renderProductCard(product: IProduct): string {
  const badge = product.disponible 
    ? `<span class="badge badge-success">Disponible</span>`
    : `<span class="badge badge-danger">No Disponible</span>`;

  return `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.imagenUrl}" alt="${product.nombre}" class="product-image">
      <div class="product-info">
        <h3 class="product-name">${product.nombre}</h3>
        <p class="product-description">${product.descripcion.substring(0, 60)}...</p>
        <p class="product-price">$${product.precio.toFixed(2)}</p>
        ${badge}
        <button class="btn btn-detail" data-id="${product.id}">Ver detalle</button>
      </div>
    </div>
  `;
}

//Navegación a detalle de producto
function setupDetailNavigation(): void {
  const buttons = document.querySelectorAll(".btn-detail");
  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = (e.target as HTMLElement).getAttribute("data-id");
      if (id) window.location.href = `../productDetail/productDetail.html?id=${id}`;
    });
  });
}
