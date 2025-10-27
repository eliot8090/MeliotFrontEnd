// src/utils/cart.ts

// Importa IProduct desde su archivo
import type { IProduct } from "../types/IProduct.ts";

// Importa ICartItem (y ICheckoutData si la vas a usar aquí) desde su archivo correcto
import type { ICartItem } from "../types/ICart.ts";

const CART_STORAGE_KEY = 'foodstore_cart';
const DELIVERY_COST = 500; // Costo de envío fijo: $500 [cite: 232]

/**
 * Obtiene el contenido actual del carrito desde localStorage.
 * @returns Array de ICartItem.
 */
export function getCart(): ICartItem[] {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
        return [];
    }
    try {
        return JSON.parse(storedCart) as ICartItem[];
    } catch (e) {
        console.error("Error al parsear el carrito de localStorage:", e);
        return [];
    }
}

/**
 * Guarda el carrito en localStorage.
 * @param cart Array de ICartItem.
 */
function saveCart(cart: ICartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

/**
 * Agrega un producto al carrito, manejando las cantidades.
 * @param product El producto a agregar.
 * @param quantity La cantidad a agregar (se valida en el componente Detalle).
 */
export function addToCart(product: IProduct, quantity: number): void {
    let cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);

    if (existingItemIndex > -1) {
        // Gestionar carrito (modificar cantidades) [cite: 138]
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Agregar productos al carrito [cite: 137]
        cart.push({ product, quantity });
    }

    saveCart(cart);
    // Opcional: Notificar al componente del navbar para actualizar el badge del carrito [cite: 199]
    document.dispatchEvent(new Event('cartUpdated')); 
}

/**
 * Elimina un producto del carrito.
 * @param productId ID del producto a eliminar.
 */
export function removeFromCart(productId: number): void {
    let cart = getCart();
    // Gestionar carrito (quitar) [cite: 138]
    cart = cart.filter(item => item.product.id !== productId);
    saveCart(cart);
    document.dispatchEvent(new Event('cartUpdated'));
}

/**
 * Modifica la cantidad de un producto específico.
 * @param productId ID del producto.
 * @param newQuantity La nueva cantidad (debe ser > 0).
 */
export function updateCartQuantity(productId: number, newQuantity: number): void {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const cart = getCart();
    const item = cart.find(item => item.product.id === productId);

    if (item) {
        // Gestión de carrito (modificar cantidades) [cite: 138]
        // Validación de stock: No permite cantidad mayor al stock disponible [cite: 217] (aunque esta validación principal debe hacerse en el componente Carrito/Detalle)
        item.quantity = Math.min(newQuantity, item.product.stock); 
        saveCart(cart);
        document.dispatchEvent(new Event('cartUpdated'));
    }
}

/**
 * Vacía completamente el carrito.
 */
export function clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY);
    document.dispatchEvent(new Event('cartUpdated'));
}

/**
 * Limpia el carrito al confirmar el pedido.
 * Se limpia al confirmar pedido[cite: 252].
 */
export function finalizeOrder(): void {
    clearCart();
}

/**
 * Calcula el resumen del pedido.
 * @returns { subtotal, envio, total }
 */
export function calculateCartSummary() {
    const cart = getCart();
    // Subtotal: suma de (precio * cantidad) de cada item
    const subtotal = cart.reduce((acc, item) => acc + (item.product.precio * item.quantity), 0);
    
    // Costo de envío (fijo: $500) [cite: 232]
    const envio = subtotal > 0 ? DELIVERY_COST : 0; // Solo hay envío si hay productos
    
    // Total
    const total = subtotal + envio;

    return {
        subtotal,
        envio,
        total,
        itemCount: cart.length // Contador del carrito con cantidad de ítems [cite: 199]
    };
}