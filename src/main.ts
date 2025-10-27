import { getSession } from "./utils/auth";
import { navigateTo } from "./utils/navigate";

// Redirección inicial 
document.addEventListener('DOMContentLoaded', () => {
    const user = getSession(); 
    
    // Si no hay sesión, redirecciona a login 
    if (!user) {
        navigateTo('/src/pages/auth/login/login.html');
        return;
    }
    
    // Si hay sesión, redirige a la página principal del rol correspondiente
    if (user.role === 'admin') {
        navigateTo('/src/pages/admin/adminHome/adminHome.html');
    } else { 
        navigateTo('/src/pages/store/home/home.html');
    }
});