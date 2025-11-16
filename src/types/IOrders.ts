// src/types/IOrders.ts

export type Estado = 'pendiente' | 'confirmado' | 'cancelado' | 'terminado';

/* =======================
   DETALLE DE PEDIDO
======================= */
export interface IDetallePedido {
  productoId: number;
  producto: {
    id: number;
    nombre: string;
  };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/* =======================
   USUARIO ANIDADO (DTO)
======================= */
export interface IUsuarioPedido {
  id: number;
  nombre: string;
  email: string;
}

/* =======================
   PEDIDO COMPLETO
======================= */
export interface IOrder {
  id: number;
  fecha: string;
  total: number;
  usuario: IUsuarioPedido; // ✅ ya no es solo el ID
  telefono: string;
  direccion: string;
  metodoPago: string;
  notasAdicionales?: string;
  estado: Estado;
  detallesPedido: IDetallePedido[];
}
