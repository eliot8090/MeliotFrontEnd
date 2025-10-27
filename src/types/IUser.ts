// Definimos tipo rol

export type Rol = "admin" | "client";

// Definimos el objeto usuario

export interface IUser{
    id: number;
    nombre: string; 
    apellido?: string; 
    email: string; 
    celular?: number; 
    contrasena: string; 
    role: Rol; 
    loggedIn: boolean;
}

// Información almacenada en localStorage

export interface ISessionUser {
    id: number;
    name: string;
    apellido?: string;
    email: string;
    role: Rol;

}