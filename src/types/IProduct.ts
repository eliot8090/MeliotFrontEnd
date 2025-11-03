export interface IProduct {
  id?: number;            
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  disponible: boolean;
  categoriaId: number;
  categoriaNombre?: string; 
}