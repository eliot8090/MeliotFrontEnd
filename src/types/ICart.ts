import type { IProduct } from "./IProduct";

// Producto tal como se almacena en el carrito
export interface ICartItem {
    product: IProduct;
    quantity: number;
}

// Información adicional necesaria para el checkout
export interface ICheckoutData {
    telefono: string; // Requerido [cite: 240]
    direccion: string; // Requerido [cite: 241]
    metodoPago: 'efectivo' | 'tarjeta' | 'transferencia'; // Opciones de pago [cite: 242]
    notasAdicionales: string; // Opcional [cite: 243]
}