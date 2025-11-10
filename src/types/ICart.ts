import type { IProduct } from "./IProduct";

// Estructura de un ítem del carrito
export interface ICartItem {
    product: IProduct;
    quantity: number;
}

// Estructura general del carrito
export interface ICheckoutData {
    telefono: string; 
    direccion: string; 
    metodoPago: 'efectivo' | 'tarjeta' | 'transferencia'; 
    notasAdicionales: string; 
}