import type { IUser, ISessionUser } from "../../../types/IUser.ts";
import { apiRequest } from "../../../utils/api.ts"; 
import { setSession, redirectToRoleHome } from "../../../utils/auth.ts"; 

// Esperamos a que se cargue el HTML

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form') as HTMLFormElement;
    const errorMessage = document.getElementById('error-message') as HTMLParagraphElement;

    // Detenemos la ejecucion si el formulario no se encuentra

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Detenemos la recarga por defecto de la página
        errorMessage.textContent = ''; // Limpiamos mensaje de error anterior, antes de procesar una nueva solicitud.

        // Obtenemos los datos

        const nameInput = document.getElementById('name') as HTMLInputElement;
        const lastnameInput = document.getElementById('lastname') as HTMLInputElement; 
        const cellphoneInput = document.getElementById('cellphone') as HTMLInputElement; 
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;

        // Almacenamos en variables locales

        const nombre = nameInput.value.trim();
        const email = emailInput.value.trim();
        const contrasena = passwordInput.value;
        const apellido = lastnameInput.value.trim(); 
        const celular = cellphoneInput.value.trim();

        // Validamos los campos

        if (!nombre || !email || contrasena.length < 6 || !apellido || !celular) {
            errorMessage.textContent = 'Por favor, complete todos los campos obligatorios: Nombre, Apellido, Celular, Email y Contraseña (mínimo 6 caracteres).';
            return;
        }

        if (celular && (celular.length < 10 || celular.length > 10 || isNaN(Number(celular)))) {
             errorMessage.textContent = 'Ingrese el numero de telefono correcto.';
             return;
        }

        // Conexión con API

        try {
            
            const newUser = {
                nombre,
                apellido, 
                celular,  
                email,
                contrasena,
            };

            // Llamada a la API de Registro

            const user = await apiRequest<IUser>('/auth/register', 'POST', newUser);

            // Auto-login después del registro 

            const sessionData: ISessionUser = {
                id: user.id,
                name: user.nombre,
                email: user.email,
                role: user.role,
            };
            
            // Guardamos datos en localStorage

            setSession(sessionData);

            // Redireccionaos al home de la tienda 
            
            redirectToRoleHome(sessionData);
        
        // Manejo de errores

        } catch (error: any) {

            // Mensaje de error por defecto

            let userMessage = 'Error en el registro. Intente con otro correo.';
            
            // Mensaje de error por email ya registrado

            if (error.message.includes("EMAIL_YA_REGISTRADO")){
                userMessage = 'Usuario ya registrado. Por favor, inicie sesión o use otro correo.';
            } 
            else if (error.message.includes("NOMBRE_REQUERIDO")) {
            userMessage = 'El nombre es obligatorio.';
            }
            else if (error.message.includes("APELLIDO_REQUERIDO")) {
                userMessage = 'El apellido es obligatorio.';
            } 
            else if (error.message.includes("CELULAR_REQUERIDO")) {
                userMessage = 'El número de celular es obligatorio.';
            }
            // Si el error es por una validación que no pasó o cualquier otro fallo.

            else if (error.message) {
                 userMessage = error.message; 
            }
            
            // Visualizamos el error

            errorMessage.textContent = userMessage;
        }
    });
});