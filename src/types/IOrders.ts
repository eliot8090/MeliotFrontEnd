export type Estado = 'pendiente' | 'confirmado' | 'cancelado' | 'terminado'; 

// Estructura de un detalle de pedido
export interface IDetallePedido {
    productoId: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

// Estructura de un pedido
export interface IOrder {
    id: number;
    fecha: string; 
    estado: Estado;
    total: number;
    usuarioId: number; 
    detallesPedido: IDetallePedido[]; 
    telefono: string; 
    direccion: string; 
    metodoPago: string; 
    notasAdicionales?: string; 
}