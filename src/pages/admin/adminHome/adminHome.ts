import { checkAuthAndRole } from "../../../utils/auth";
import type { ISessionUser } from "../../../types/IUser.ts";
import { logout } from "../../../utils/auth.ts"; 

document.addEventListener('DOMContentLoaded', () => {
    // Verificamos si el usuario está autenticado y es 'admin'
    const user: ISessionUser | null = checkAuthAndRole('admin'); 

    // Si user es null, la función checkAuthAndRole redirige al usuario.
    if (!user) {
        return; 
    }

    //  Si es admin, cargamos el resto de la página
    console.log(`Bienvenido, Administrador: ${user.name}`);

    // Asignamos funcionalidad al boton
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    console.log(`Página de Admin: ${user.name}`);
});