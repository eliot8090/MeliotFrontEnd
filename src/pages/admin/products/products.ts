import { checkAuthAndRole } from "../../../utils/auth.ts";
import { renderSidebar } from "../../../components/Sidebar/sidebar.ts";
import { apiGet, apiRequest } from "../../../utils/api.ts";
import type { ISessionUser } from "../../../types/IUser.ts";
import type { IProduct } from "../../../types/IProduct.ts";
import type { ICategoria } from "../../../types/ICategoria.ts";

const PRODUCTS_TABLE_BODY_ID = 'products-table-body';
const NEW_PRODUCT_BTN_ID = 'new-product-btn';
const LOADING_MESSAGE_ID = 'loading-message';
const PRODUCT_MODAL_ID = 'product-modal';

// VARIABLES GLOBALES

let products: IProduct[] = [];
let categories: ICategoria[] = [];


document.addEventListener('DOMContentLoaded', async () => {
  const user: ISessionUser | null = checkAuthAndRole('admin');
  if (!user) return;

  await renderSidebar(user);
  await loadInitialData();
  setupPageListeners();
});

/* CARGA INICIAL */ 

async function loadInitialData(): Promise<void> {
  const loadingMessage = document.getElementById(LOADING_MESSAGE_ID);
  if (loadingMessage) loadingMessage.textContent = 'Cargando datos...';

  try {
    categories = await apiGet<ICategoria[]>('/categorias');
    await loadProductsTable();
  } catch (error: any) {
    console.error("Error al cargar datos iniciales:", error);
    if (loadingMessage)
      loadingMessage.textContent = `Error al cargar: ${error.message}`;
  }
}

/* CONFIGURACIÓN DE LISTENERS GENERALES */

function setupPageListeners(): void {
  const newBtn = document.getElementById(NEW_PRODUCT_BTN_ID);
  if (newBtn) newBtn.addEventListener('click', () => openProductModal());

  const tableBody = document.getElementById(PRODUCTS_TABLE_BODY_ID);
  if (tableBody) tableBody.addEventListener('click', handleTableAction);
}

/* TABLA DE PRODUCTOS */

async function loadProductsTable(): Promise<void> {
  const tableBody = document.getElementById(PRODUCTS_TABLE_BODY_ID);
  const loadingMessage = document.getElementById(LOADING_MESSAGE_ID);
  if (!tableBody || !loadingMessage) return;

  tableBody.innerHTML = '';
  loadingMessage.textContent = 'Cargando productos...';

  try {
    products = await apiGet<IProduct[]>('/productos');
    if (products.length === 0) {
      loadingMessage.textContent = 'No hay productos creados.';
    } else {
      renderProductsTable(products, tableBody);
      loadingMessage.style.display = 'none';
    }
  } catch (error: any) {
    console.error("Error al cargar productos:", error);
    loadingMessage.textContent = `Error: ${error.message}`;
  }
}

/* RENDERIZAR TABLA */

function renderProductsTable(data: IProduct[], tableBody: HTMLElement): void {
  const rowsHTML = data.map(prod => {
    const estado = prod.disponible
      ? `<span class="badge badge-success">Disponible</span>`
      : `<span class="badge badge-danger">No Disponible</span>`;

    return `
      <tr>
        <td>${prod.id}</td>
        <td><img src="${prod.imagenUrl}" alt="Thumbnail" class="product-thumbnail"></td>
        <td>${prod.nombre}</td>
        <td class="col-descripcion">${prod.descripcion || '-'}</td>
        <td>${prod.categoriaNombre ?? 'Sin categoría'}</td>
        <td>$${prod.precio.toFixed(2)}</td>
        <td>${prod.stock}</td>
        <td>${estado}</td>
        <td>
          <button class="btn btn-sm btn-secondary edit-btn" data-id="${prod.id}">Editar</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${prod.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');

  tableBody.innerHTML = rowsHTML;
}

/* EDITAR / ELIMINAR */

function handleTableAction(e: Event): void {
  const target = e.target as HTMLElement;
  const id = parseInt(target.getAttribute('data-id') || '0', 10);
  if (!id) return;

  if (target.classList.contains('edit-btn')) {
    const product = products.find(p => p.id === id);
    if (product) openProductModal(product);
  } else if (target.classList.contains('delete-btn')) {
    deleteProduct(id);
  }
}

async function deleteProduct(id: number): Promise<void> {
  if (!confirm(`¿Desea eliminar el producto con ID ${id}?`)) return;

  try {
    await apiRequest<void>(`/productos/${id}`, 'DELETE');
    alert('✅ Producto eliminado con éxito.');
    await loadProductsTable();
  } catch (error: any) {
    console.error("Error al eliminar producto:", error);
    alert(`Error: ${error.message}`);
  }
}

/* MODAL: CREAR / EDITAR PRODUCTO */

function openProductModal(product?: IProduct): void {
  const modal = document.getElementById(PRODUCT_MODAL_ID) as HTMLDivElement | null;
  if (!modal) return;

  const isEditing = !!product;
  modal.innerHTML = getProductModalHTML(product);

  const form = modal.querySelector('#product-form') as HTMLFormElement;
  const closeBtn = modal.querySelector('#close-modal-btn') as HTMLButtonElement;
  const backdrop = modal.querySelector('.modal-backdrop') as HTMLDivElement;
  const dialog = modal.querySelector('.modal-dialog') as HTMLDivElement;

  form.addEventListener('submit', (e) => handleSaveOrUpdate(e, isEditing, product?.id));

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeProductModal();
  });

  // Cerrar al hacer click fuera
  backdrop.addEventListener('click', closeProductModal);
  dialog.addEventListener('click', (e) => e.stopPropagation());

  // Escape key
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeProductModal();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  showProductModal();
}

/* GUARDAR / ACTUALIZAR PRODUCTO */

async function handleSaveOrUpdate(e: Event, isEditing: boolean, id?: number): Promise<void> {
  e.preventDefault();

  const formError = document.getElementById('modal-error');
  if (formError) formError.textContent = '';

  const name = (document.getElementById('product-name') as HTMLInputElement).value.trim();
  const description = (document.getElementById('product-desc') as HTMLTextAreaElement).value.trim();
  const price = parseFloat((document.getElementById('product-price') as HTMLInputElement).value);
  const stock = parseInt((document.getElementById('product-stock') as HTMLInputElement).value, 10);
  const imageUrl = (document.getElementById('product-url') as HTMLInputElement).value.trim();
  const categoryIdStr = (document.getElementById('product-category') as HTMLSelectElement).value;
  const available = (document.getElementById('product-available') as HTMLInputElement).checked;

  if (!name || !description || !imageUrl || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0 || !categoryIdStr) {
    if (formError) formError.textContent = 'Por favor completá todos los campos correctamente.';
    return;
  }

  const payload: IProduct = {
    id: isEditing ? id : undefined,
    nombre: name,
    descripcion: description,
    precio: price,
    stock: stock,
    imagenUrl: imageUrl,
    disponible: available,
    categoriaId: Number(categoryIdStr)
  };

  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `/productos/${id}` : '/productos';

  try {
    await apiRequest<IProduct>(url, method, payload);
    alert(`✅ Producto ${isEditing ? 'actualizado' : 'creado'} con éxito.`);
    closeProductModal();
    await loadProductsTable();
  } catch (error: any) {
    console.error("Error al guardar producto:", error);
    if (formError) formError.textContent = `Error: ${error.message}`;
  }
}

/* HTML DEL MODAL */

function getProductModalHTML(product?: IProduct): string {
  const isEditing = !!product;
  const title = isEditing ? `Editar Producto #${product?.id}` : 'Nuevo Producto';

  const nombre = product?.nombre || '';
  const descripcion = product?.descripcion || '';
  const precio = product?.precio || '';
  const stock = product?.stock || '';
  const imagenUrl = product?.imagenUrl || '';
  const disponibleChecked = product?.disponible ? 'checked' : '';

  const categoryOptions = categories.map(cat =>
    `<option value="${cat.id}" ${cat.id === product?.categoriaId ? 'selected' : ''}>${cat.nombre}</option>`
  ).join('');

  return `
    <div class="modal-backdrop" data-close="true"></div>
    <div class="modal-dialog" role="dialog" aria-modal="true">
      <form id="product-form" class="modal-form">
        <h3 id="modal-title">${title}</h3>

        <label for="product-name">Nombre</label>
        <input type="text" id="product-name" value="${nombre}" required>

        <label for="product-desc">Descripción</label>
        <textarea id="product-desc" rows="3" required>${descripcion}</textarea>

        <div class="form-group-inline">
          <div class="form-group">
            <label for="product-price">Precio</label>
            <input type="number" id="product-price" value="${precio}" step="0.01" min="0.01" required>
          </div>
          <div class="form-group">
            <label for="product-stock">Stock</label>
            <input type="number" id="product-stock" value="${stock}" min="0" required>
          </div>
        </div>

        <label for="product-category">Categoría</label>
        <select id="product-category" required>
          <option value="">Seleccione una categoría</option>
          ${categoryOptions}
        </select>

        <label for="product-url">URL de Imagen</label>
        <input type="url" id="product-url" value="${imagenUrl}" required>

        <div class="checkbox-group">
          <input type="checkbox" id="product-available" ${disponibleChecked}>
          <label for="product-available">Producto disponible</label>
        </div>

        <div class="modal-actions">
          <button type="submit" class="btn btn-primary">${isEditing ? 'Guardar Cambios' : 'Crear Producto'}</button>
          <button type="button" id="close-modal-btn" class="btn btn-secondary">Cancelar</button>
        </div>

        <p id="modal-error" class="error-text"></p>
      </form>
    </div>
  `;
}

/* HELPERS MODAL */

function showProductModal(): void {
  const modal = document.getElementById(PRODUCT_MODAL_ID);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeProductModal(): void {
  const modal = document.getElementById(PRODUCT_MODAL_ID);
  if (modal) {
    modal.classList.add('hidden');
    modal.innerHTML = '';
    document.body.style.overflow = '';
  }
}
