import type { ISessionUser } from "../../types/IUser.ts";
import type { ICategoria } from "../../types/ICategoria.ts"; 
import { apiGet } from "../../utils/api.ts";

const SIDEBAR_CONTAINER_ID = 'sidebar-container';

/* Renderiza el Sidebar según el rol del usuario */

export async function renderSidebar(user: ISessionUser): Promise<void> {
    const container = document.getElementById(SIDEBAR_CONTAINER_ID);
    if (!container) return;

    let contentHTML = '';

    if (user.role === 'admin') {
        contentHTML = renderAdminSidebar();
    } else { 
        contentHTML = await renderClientSidebar();
    }

    container.innerHTML = contentHTML;
}

/* Sidebar para el panel de administración */

function renderAdminSidebar(): string {
  return `
    <nav class="sidebar-nav">
        <h4 class="sidebar-title">Administración</h4>
        <h5 class="sidebar-subtitle">Panel de control</h5>
        
        <a href="../adminHome/adminHome.html" class="sidebar-link">
            <span class="material-icons sidebar-icon">dashboard</span> Dashboard
        </a>
        <a href="../categories/categories.html" class="sidebar-link">
            <span class="material-icons sidebar-icon">folder</span> Categorías
        </a>
        <a href="../products/products.html" class="sidebar-link">
            <span class="material-icons sidebar-icon">lunch_dining</span> Productos
        </a>
        <a href="../orders/orders.html" class="sidebar-link">
            <span class="material-icons sidebar-icon">inventory_2</span> Pedidos
        </a>

        <div class="sidebar-divider"></div>

        <a href="../../../index.html" class="sidebar-link sidebar-shop-link">
            <span class="material-icons sidebar-icon">storefront</span> Ver Tienda
        </a>
    </nav>
  `;
}

/* Sidebar para la tienda del cliente (lista de categorías) */

async function renderClientSidebar(): Promise<string> {
    try {
        // Obtiene la lista de categorías desde el backend
        const categorias = await apiGet<ICategoria[]>('/categorias'); 
        
        let categoriesList = `<a href="#" class="sidebar-category-link active" data-id="all">Todos los Productos</a>`;
        
        // Recorre todas las categorías y crea un enlace por cada una
        categorias.forEach(cat => {
            categoriesList += `
                <a href="#" class="sidebar-category-link" data-id="${cat.id}">
                    ${cat.nombre}
                </a>
            `;
        });
        
        // Retorna el HTML completo del sidebar de cliente
        return `
            <nav class="sidebar-nav">
                <h4 class="sidebar-title">CATEGORÍAS</h4>
                ${categoriesList}
            </nav>
        `;

    } catch (error) {
        console.error("Error al cargar categorías:", error);
        return `<p class="error-text">No se pudieron cargar las categorías.</p>`;
    }
}