import type { ICategoria } from "./ICategoria";

export interface IProduct {
    id: number;
    nombre: string;
    descripcion: string; // Necesario para el detalle/CRUD [cite: 319]
    precio: number;
    stock: number; // Necesario para el detalle/CRUD [cite: 322]
    imagenUrl: string; // Para el grid y CRUD [cite: 192, 317]
    disponible: boolean; // Checkbox "Producto disponible" en CRUD Admin [cite: 333]
    categoria: ICategoria; // Relación 1..n con Categoría 
}