import type { IProduct } from "../types/IProduct";

//Estructura de un ítem del carrito
export interface CartItem {
  product: IProduct;
  quantity: number;
}

//Estructura general del carrito
export interface Cart {
  items: CartItem[];
}

//Obtiene el carrito actual desde localStorage.

export function getCart(): Cart {
  const stored = localStorage.getItem("cart");
  if (!stored) return { items: [] };
  try {
    return JSON.parse(stored);
  } catch {
    return { items: [] };
  }
}

//Guarda el carrito actualizado en localStorage.
export function saveCart(cart: Cart): void {
  localStorage.setItem("cart", JSON.stringify(cart));
}

//Limpia todo el carrito.
export function clearCart(): void {
  localStorage.removeItem("cart");
}

//Agrega un producto al carrito o aumenta su cantidad
export function addToCart(product: IProduct, quantity: number = 1): void {
  const cart = getCart();
  const existingItem = cart.items.find(item => item.product.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product, quantity });
  }

  saveCart(cart);
}

//Elimina un producto completamente del carrito.
export function removeFromCart(productId: number): void {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.product.id !== productId);
  saveCart(cart);
}

//Actualiza la cantidad de un producto (puede sumar o restar). Si la cantidad llega a 0, lo elimina.
export function updateCartItem(productId: number, delta: number): void {
  const cart = getCart();
  const item = cart.items.find(i => i.product.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart.items = cart.items.filter(i => i.product.id !== productId);
  }

  saveCart(cart);
}

//Calcula el total y cantidad de ítems del carrito.
export function calculateCartSummary() {
  const cart = getCart();
  const total = cart.items.reduce(
    (acc, item) => acc + item.product.precio * item.quantity,
    0
  );
  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return { total, itemCount };
}
