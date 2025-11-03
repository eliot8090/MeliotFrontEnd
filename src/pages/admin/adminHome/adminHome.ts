import { checkAuthAndRole, logout } from "../../../utils/auth.ts";
import { renderSidebar } from "../../../components/Sidebar/sidebar.ts";
import { apiGet } from "../../../utils/api.ts";
import type { ISessionUser } from "../../../types/IUser.ts";
import type { ICategoria } from "../../../types/ICategoria.ts";
import type { IProduct } from "../../../types/IProduct.ts";

const STATS_GRID_ID = 'dashboard-stats';
const LOADING_MESSAGE_ID = 'loading-message';
const CATEGORIES_SUMMARY_ID = 'categories-summary';
const PRODUCTS_SUMMARY_ID = 'products-summary';
const ORDERS_SUMMARY_ID = 'orders-summary';

// Interfaz interna para representar las estadísticas globales

interface IStats {
    totalCategorias: number;
    totalProductos: number;
    productosDisponibles: number;
    totalPedidos: number;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si el usuario está autenticado como 'admin'
    const user: ISessionUser | null = checkAuthAndRole('admin');
    if (!user) return; // Redirige si no es admin

    // Carga el sidebar de administrador
    await renderSidebar(user); 
    
    // Configurar botón de logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Cargar y mostrar datos del dashboard
    await loadDashboardData();
    
    //  Oculta el mensaje de “Cargando...” una vez todo está renderizado
    const loadingMessage = document.getElementById(LOADING_MESSAGE_ID);
    if(loadingMessage) loadingMessage.style.display = 'none';

    console.log(`Bienvenido, Administrador: ${user.name}`);
});

/* Carga y renderiza las estadísticas y resúmenes */

async function loadDashboardData(): Promise<void> {
    const statsGrid = document.getElementById(STATS_GRID_ID);
    
    try {
        // Llamadas al backend
        const categorias = await apiGet<ICategoria[]>('/categorias'); // Obtenemos todas las categorías
        const productos = await apiGet<IProduct[]>('/productos?disponible=false'); // Obtenemos todos los productos
        

        const productosDisponibles = productos.filter(p => p.disponible).length;

        const stats: IStats = {
            totalCategorias: categorias.length,
            totalProductos: productos.length,
            productosDisponibles: productosDisponibles,
            totalPedidos: 42 // Valor simulado, esperando endpoint real
        };
        
        // Renderizar las tarjetas de estadísticas y paneles de resumen
        renderStatCards(statsGrid, stats);
        renderSummaryPanels(categorias, productos, 42); 

    } catch (error: any) {
        console.error("Error al cargar el dashboard:", error);
        document.getElementById(LOADING_MESSAGE_ID)!.textContent = 'Error: No se pudo conectar con los servicios de datos.';
        document.getElementById(LOADING_MESSAGE_ID)!.style.display = 'block';
    }
}

/* Generar y renderizar las tarjetas de estadísticas */

function renderStatCards(grid: HTMLElement | null, stats: IStats): void {
    if (!grid) return;

    // Generar el HTML de las tarjetas
    grid.innerHTML = `
        ${renderCard('Total de Categorías', stats.totalCategorias.toString(), 'bg-purple')}
        ${renderCard('Total de Productos', stats.totalProductos.toString(), 'bg-pink')}
        ${renderCard('Productos Disponibles', stats.productosDisponibles.toString(), 'bg-success')}
        ${renderCard('Total de Pedidos', stats.totalPedidos.toString(), 'bg-blue')}
    `;
}

/* Generar el HTML de una tarjeta estadística */

function renderCard(title: string, value: string, colorClass: string): string {
    return `
        <div class="stat-card ${colorClass}">
            <p class="card-value">${value}</p>
            <p class="card-title">${title}</p>
            <button class="btn btn-sm btn-light">Ver Más</button>
        </div>
    `;
}

/* Renderizar los paneles de resumen */

function renderSummaryPanels(categorias: ICategoria[], productos: IProduct[], totalPedidos: number): void {
    const categoriesSummary = document.getElementById(CATEGORIES_SUMMARY_ID);
    const productsSummary = document.getElementById(PRODUCTS_SUMMARY_ID);
    const ordersSummary = document.getElementById(ORDERS_SUMMARY_ID);

    // Panel de categorías

    if (categoriesSummary) {
        categoriesSummary.innerHTML = `Categorías activas: <b>${categorias.length}</b>`;
    }
    
    const productosInactivos = productos.filter(p => !p.disponible).length;

    // Panel de productos

    if (productsSummary) {
        productsSummary.innerHTML = `Total de Productos: <b>${productos.length}</b> | Inactivos: <b>${productosInactivos}</b>`;
    }

    // Panel de pedidos
    
    if (ordersSummary) {
        ordersSummary.innerHTML = `Total de Pedidos (Simulado): <b>${totalPedidos}</b>`; 
    }
}