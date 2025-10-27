import { logout } from "../../../utils/auth.ts"; 
import { checkAuthAndRole } from "../../../utils/auth.ts";
import type { ISessionUser } from "../../../types/IUser.ts";

document.addEventListener('DOMContentLoaded', () => {
    // Verificamos autenticación (el cliente no necesita un rol)
    const user: ISessionUser | null = checkAuthAndRole(null); 
    
    if (!user) {
        return; 
    }
    
    console.log(`Página de Tienda: Bienvenido, ${user.name}`);
    
    // Asignamos el nombre del usuario 
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    // Asignamos funcionalidad al boton. 
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

});