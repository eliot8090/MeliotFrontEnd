import type { ISessionUser, Rol } from "../types/IUser.ts";
import { navigateTo } from "./navigate"; 

// Definimos clave del localStorage
const SESSION_STORAGE_KEY = 'foodstore_session';

//Guardamos la información del usuario en localStorage después de un login o registro exitoso.
export function setSession(user: ISessionUser): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

//Obtenemos la información de la sesión del usuario desde localStorage.
export function getSession(): ISessionUser | null {
    const storedUser = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedUser) {
        return null;
    }
    try {
        // Conviertimos los datos del JSON a un objeto Js
        return JSON.parse(storedUser) as ISessionUser;
    } catch (e) {
        // En caso de que el localStorage no sea válido
        console.error("Error al parsear la sesión de localStorage:", e);
        return null;
    }
}

//Cierra la sesión: Limpiamos localStorage y redireccionamos al login.
export function logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY); 
    navigateTo('/src/pages/auth/login/login.html'); 
}

/**
 * Verificamos si el usuario está autenticado y tiene un rol específico.
 * @param requiredRole El rol necesario ('admin' o 'cliente'). Si es null, solo verifica la autenticación.
 */
export function checkAuthAndRole(requiredRole: Rol | null = null): ISessionUser | null {
    const user = getSession();

    if (!user) {
        // Si no hay sesión, redireccionamos a login 
        navigateTo('/pages/auth/login/login.html');
        return null;
    }
    
    // Validamos permisos según el rol
    if (requiredRole && user.role !== requiredRole) {
        // Si el cliente intenta acceder al panel de administración 
        console.warn(`Acceso denegado. Rol requerido: ${requiredRole}, Rol actual: ${user.role}`);
        // Redirigimos a la página principal del cliente si el rol NO es 'admin'.
        if (user.role !== 'admin') { 
            navigateTo("/src/pages/store/home/home.html");
         // Si un administrador intenta acceder a una página que requiere un rol distinto
        } else {
            navigateTo('/pages/admin/adminHome/adminHome.html'); 
        }
        return null;
    }
    return user;
}

/**
 * Redirecciona al usuario después del login/registro según su rol.
 * @param user El usuario autenticado.
 */
export function redirectToRoleHome(user: ISessionUser): void {
    
    // Si el rol es admin, redirige a adminHome
    if (user.role === 'admin') {
        navigateTo('/src/pages/admin/adminHome/adminHome.html'); 
    // Si el rol es cliente, redirige al store/home
    } else { 
        navigateTo ("/src/pages/store/home/home.html"); 
    }
}