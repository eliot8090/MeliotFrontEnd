import { renderSidebar } from "../../../components/Sidebar/sidebar.ts";
import { apiGet, apiRequest } from "../../../utils/api.ts";
import { checkAuthAndRole } from "../../../utils/auth.ts";
import type { ISessionUser } from "../../../types/IUser.ts";
import type { ICategoria } from "../../../types/ICategoria.ts";

const CATEGORIES_TABLE_BODY_ID = 'categories-table-body';
const NEW_CATEGORY_BTN_ID = 'new-category-btn';
const LOADING_MESSAGE_ID = 'loading-message';
const CATEGORY_MODAL_ID = 'category-modal';

// Estado global de categorías
let categories: ICategoria[] = [];


document.addEventListener('DOMContentLoaded', async () => {
  const user: ISessionUser | null = checkAuthAndRole('admin');
  if (!user) return; // Si no es admin, redirige automáticamente

  await renderSidebar(user);
  setupPageListeners();
  await loadCategories();
});

/* CONFIGURACIÓN DE LISTENERS GENERALES */

function setupPageListeners(): void {
  const newBtn = document.getElementById(NEW_CATEGORY_BTN_ID);
  if (newBtn) newBtn.addEventListener('click', () => openCategoryModal());

  const tableBody = document.getElementById(CATEGORIES_TABLE_BODY_ID);
  if (tableBody) tableBody.addEventListener('click', handleTableAction);
}

/* CRUD: CARGAR Y MOSTRAR CATEGORÍAS */

async function loadCategories(): Promise<void> {
  const tableBody = document.getElementById(CATEGORIES_TABLE_BODY_ID);
  const loadingMessage = document.getElementById(LOADING_MESSAGE_ID);
  if (!tableBody || !loadingMessage) return;

  tableBody.innerHTML = '';
  loadingMessage.textContent = 'Cargando categorías...';

  try {
    const data = await apiGet<ICategoria[]>('/categorias');
    categories = data;

    if (categories.length === 0) {
      loadingMessage.style.display = 'block';
      loadingMessage.textContent = 'No hay categorías creadas.';
    } else {
      renderCategoriesTable(categories, tableBody);
      loadingMessage.style.display = 'none';
    }
  } catch (error: any) {
    console.error("Error al cargar categorías:", error);
    loadingMessage.textContent = `Error: ${error.message}`;
  }
}

/* RENDERIZAR TABLA */

function renderCategoriesTable(data: ICategoria[], tableBody: HTMLElement): void {
  tableBody.innerHTML = data.map(cat => `
    <tr>
      <td>${cat.id}</td>
      <td><img src="${cat.imagenUrl}" alt="${cat.nombre}" class="category-thumbnail"></td>
      <td>${cat.nombre}</td>
      <td>${cat.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-secondary edit-btn" data-id="${cat.id}">Editar</button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${cat.id}">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

/* ACCIONES: EDITAR / ELIMINAR */

function handleTableAction(e: Event): void {
  const target = e.target as HTMLElement;
  const categoryId = target.getAttribute('data-id');
  if (!categoryId) return;

  const id = parseInt(categoryId);
  if (target.classList.contains('edit-btn')) {
    const categoryToEdit = categories.find(c => c.id === id);
    if (categoryToEdit) openCategoryModal(categoryToEdit);
  } else if (target.classList.contains('delete-btn')) {
    deleteCategory(id);
  }
}

async function deleteCategory(id: number): Promise<void> {
  if (!confirm(`¿Eliminar la categoría con ID ${id}?`)) return;

  try {
    await apiRequest<void>(`/categorias/${id}`, 'DELETE');
    alert('Categoría eliminada correctamente.');
    await loadCategories();
  } catch (error: any) {
    console.error("Error al eliminar:", error);
    const msg = error.message.includes("CATEGORIA_CON_PRODUCTOS")
      ? "⚠️ No se puede eliminar una categoría con productos asociados."
      : error.message;
    alert(msg);
  }
}

/* MODAL: CREAR / EDITAR CATEGORÍA */

function openCategoryModal(category?: ICategoria): void {
  const modal = document.getElementById(CATEGORY_MODAL_ID);
  if (!modal) return;

  const isEditing = !!category;
  modal.innerHTML = `
    <div class="modal-backdrop" data-close="true"></div>
    <div class="modal-dialog">
      <form id="category-form" class="modal-form">
        <h3>${isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h3>

        <label for="category-name">Nombre</label>
        <input id="category-name" type="text" value="${category?.nombre ?? ''}" required>

        <label for="category-desc">Descripción</label>
        <textarea id="category-desc" rows="3" required>${category?.descripcion ?? ''}</textarea>

        <label for="category-url">URL de Imagen</label>
        <input id="category-url" type="url" value="${category?.imagenUrl ?? ''}" required>

        <div class="modal-actions">
          <button type="submit" class="btn btn-primary">${isEditing ? 'Guardar Cambios' : 'Crear Categoría'}</button>
          <button type="button" id="close-modal-btn" class="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  const form = modal.querySelector('#category-form') as HTMLFormElement;
  const closeBtn = modal.querySelector('#close-modal-btn') as HTMLButtonElement;
  const backdrop = modal.querySelector('.modal-backdrop') as HTMLDivElement;
  const dialog = modal.querySelector('.modal-dialog') as HTMLDivElement;

  form.addEventListener('submit', (e) => handleSaveOrUpdate(e, isEditing, category?.id));
  closeBtn.addEventListener('click', closeCategoryModal);
  backdrop.addEventListener('click', closeCategoryModal);
  dialog.addEventListener('click', (e) => e.stopPropagation());

  showCategoryModal();
}

/* MODAL: MOSTRAR / CERRAR */

function showCategoryModal(): void {
  const modal = document.getElementById(CATEGORY_MODAL_ID);
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCategoryModal(): void {
  const modal = document.getElementById(CATEGORY_MODAL_ID);
  if (!modal) return;
  modal.classList.add('hidden');
  modal.innerHTML = '';
  document.body.style.overflow = '';
}

/* CRUD: CREAR / ACTUALIZAR */

async function handleSaveOrUpdate(e: Event, isEditing: boolean, id?: number): Promise<void> {
  e.preventDefault();

  const name = (document.getElementById('category-name') as HTMLInputElement).value.trim();
  const description = (document.getElementById('category-desc') as HTMLTextAreaElement).value.trim();
  const imageUrl = (document.getElementById('category-url') as HTMLInputElement).value.trim();

  if (!name || !description || !imageUrl) {
    alert("⚠️ Todos los campos son obligatorios.");
    return;
  }

  const payload: ICategoria = { id, nombre: name, descripcion: description, imagenUrl: imageUrl };

  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `/categorias/${id}` : '/categorias';

  try {
    await apiRequest<ICategoria>(url, method, payload);
    alert(`Categoría ${isEditing ? 'actualizada' : 'creada'} con éxito.`);
    closeCategoryModal();
    await loadCategories();
  } catch (error: any) {
    console.error(`Error al ${isEditing ? 'actualizar' : 'crear'}:`, error);
    alert(error?.message || 'Ocurrió un error en el servidor.');
  }
}
