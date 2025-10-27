import type { IUser, ISessionUser} from "../../../types/IUser";
import { apiRequest } from "../../../utils/api.ts";
import { setSession, redirectToRoleHome } from "../../../utils/auth.ts";

// Esperamos a que se cargue el HTML

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form') as HTMLFormElement;
    const errorMessage = document.getElementById('error-message') as HTMLParagraphElement;

    // Detenemos la ejecucion si el formulario no se encuentra

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Detenemos la recarga por defecto de la página
        errorMessage.textContent = ''; // Limpiaamos mensaje de error anterior, antes de procesar una nueva solicitud.
        
        // Obtenemos los datos

        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;

        const email = emailInput.value.trim(); 
        const contrasena = passwordInput.value; 

        // Validamos que se ingresen ambos datos

        if (!email || !contrasena) {
            errorMessage.textContent = 'Por favor, ingrese email y contraseña.';
            return;
        }
        
        // Conexión con API

        try {
            
            const user = await apiRequest<IUser>('/auth/login', 'POST', { 
                email, 
                contrasena 
            });

            // Mapeamos el rol

            const sessionData: ISessionUser = {
                id: user.id,
                name: user.nombre,
                apellido: user.apellido,
                email: user.email,
                role: user.role, 
            };

            // Guardamos datos en localStorage
            setSession(sessionData);

            // Redireccionamos según el rol
            redirectToRoleHome(sessionData);

        // Manejo de errores

        } catch (error: any) {

            // Mensaje de error por defecto

            let userMessage = 'Error de conexión o credenciales incorrectas.'; 
            
            // Mensaje de error por email no encontrado

            if (error.message.includes("EMAIL_NO_ENCONTRADO")) {
                userMessage = 'Usuario no encontrado. Por favor, regístrese si no tiene una cuenta.';
            } 

            // Mensaje de error por contraseña incorrecta 

            else if (error.message.includes("CONTRASENA_INCORRECTA")) {
                userMessage = 'Contraseña incorrecta. Intente de nuevo.';
            } 

            // Para errores 404, 400, o cualquier otro fallo de red/servidor genérico

            else {
                userMessage = error.message; 
            }

            // Visualizamos el error

            errorMessage.textContent = userMessage;
        }
    });
});