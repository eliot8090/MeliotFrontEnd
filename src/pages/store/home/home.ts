import { logout } from "../../../utils/auth.ts"; 
import { checkAuthAndRole } from "../../../utils/auth.ts";
import type { ISessionUser } from "../../../types/IUser.ts";
import { renderSidebar } from "../../../components/Sidebar/sidebar.ts";
import { apiGet } from "../../../utils/api.ts";
import type { IProduct } from "../../../types/IProduct.ts";
import type { ICategoria } from "../../../types/ICategoria.ts";

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

document.addEventListener('DOMContentLoaded', async () => {

    // Verificamos autenticación (el cliente no necesita un rol)
    const user: ISessionUser | null = checkAuthAndRole(null); 
    
    // Si no hay sesión, checkAuthAndRole ya redirigió; detenemos la ejecución.
    if (!user) {
        return; 
    }
    
    console.log(`Página de Tienda: Bienvenido, ${user.name}`);
    
    // Asignamos el nombre del usuario 
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    // Asignamos funcionalidad al boton. 
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    await renderSidebar(user);

    setupEventListeners();
    await loadProducts();
});

function setupEventListeners(): void {
    const searchInput = document.getElementById(SEARCH_INPUT_ID);
    const sortSelect = document.getElementById(SORT_SELECT_ID);
    const sidebarContainer = document.getElementById('sidebar-container');
    
    // Listener para Búsqueda en tiempo real
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentFilters.searchQuery = (searchInput as HTMLInputElement).value.trim();
            loadProducts(); 
        });
    }

    // Listener para Ordenamiento
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentFilters.sortOrder = (sortSelect as HTMLSelectElement).value;
            loadProducts(); 
        });
    }

    // Listener para Filtro por Categoría (Delegación de Eventos)
    if (sidebarContainer) {
        sidebarContainer.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('sidebar-category-link')) {
                e.preventDefault();
                
                // Actualizar la categoría seleccionada
                currentFilters.categoryId = target.getAttribute('data-id') || 'all';

                // Remover la clase 'active' de todos los links y agregarla al actual
                document.querySelectorAll('.sidebar-category-link').forEach(link => {
                    link.classList.remove('active');
                });
                target.classList.add('active');

                loadProducts(); 
            }
        });
    }
}


/**
 * 💡 FUNCIÓN PRINCIPAL: Carga, filtra, busca y ordena los productos.
 */
async function loadProducts() {
    const grid = document.getElementById(PRODUCT_GRID_ID);
    const loading = document.getElementById(LOADING_MESSAGE_ID);
    const countDisplay = document.getElementById(PRODUCT_COUNT_ID);

    if (!grid || !loading || !countDisplay) return;

    grid.innerHTML = '';
    loading.textContent = 'Cargando productos...';
    loading.style.display = 'block';

    try {
        // Construcción de la URL de la API con los filtros
        let url = `/productos?disponible=true`;
        
        if (currentFilters.categoryId !== 'all') {
            // Aseguramos que sea un ID numérico para el backend
            url += `&category=${currentFilters.categoryId}`; 
        }

        // Si hay texto de búsqueda, lo agregamos (asumiendo que el backend lo maneja)
        if (currentFilters.searchQuery) url += `&search=${currentFilters.searchQuery}`;
        
        // Si hay ordenamiento, lo agregamos (asumiendo que el backend lo maneja)
        if (currentFilters.sortOrder !== 'default') url += `&sort=${currentFilters.sortOrder}`;

        const products = await apiGet<IProduct[]>(url);

        // Renderizado
        if (products.length === 0) {
            loading.textContent = 'No se encontraron productos que coincidan con la búsqueda.';
        } else {
            products.forEach(product => {
                grid.innerHTML += renderProductCard(product);
            });
            loading.style.display = 'none';
        }

        countDisplay.textContent = `Se encontraron ${products.length} productos.`;

    } catch (error) {
        console.error("Error al cargar productos:", error);
        loading.textContent = 'Error al conectar con el servidor de productos.';
    }
    
}

/**
 * Genera el HTML para la tarjeta de un solo producto.
 */
function renderProductCard(product: IProduct): string {
    const availabilityBadge = product.disponible 
        ? `<span class="badge badge-success">Disponible</span>`
        : `<span class="badge badge-danger">No Disponible</span>`;

    return `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.imagenUrl}" alt="${product.nombre}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.nombre}</h3>
                <p class="product-description">${product.descripcion.substring(0, 50)}...</p>
                <p class="product-price">$${product.precio.toFixed(2)}</p>
                ${availabilityBadge}
                <button class="btn btn-add-cart" data-product-id="${product.id}">Ver Detalle</button>
            </div>
        </div>
    `;

}