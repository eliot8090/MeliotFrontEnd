import type { IProduct } from "./IProduct";
import type { IUser } from "./IUser";

export type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'TERMINADO'; // Basado en la entidad 'Estado' del backend [cite: 270, 10]

// El DetallePedido se corresponde con un ICartItem, pero con subtotal
export interface IDetallePedido {
    id: number; // del DetallePedido
    cantidad: number; // Según UML 
    subtotal: number; // Según UML 
    producto: IProduct; // Relación 1..m con Producto 
}

export interface IOrder {
    id: number;
    fecha: string; // 'LocalDate' en el backend, se usará 'string' o 'Date' en TS. Usaremos string por ahora.
    estado: EstadoPedido;
    total: number;
    usuario: IUser; // Relación 1..m con Usuario 
    detallesPedido: IDetallePedido[]; // Composición con DetallePedido 
    
    // Información del Checkout que se almacena en el Pedido
    telefono: string; // Del formulario de checkout [cite: 240]
    direccion: string; // Del formulario de checkout [cite: 241]
    metodoPago: string; // Del formulario de checkout [cite: 242]
    notasAdicionales?: string; // Del formulario de checkout [cite: 243]
}