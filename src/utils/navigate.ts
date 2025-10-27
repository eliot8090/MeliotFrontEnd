/**
 * Redirige al navegador a una nueva URL.
 * * @param path La ruta de destino (ej: '/src/pages/auth/login/login.html').
 */
export function navigateTo(path: string): void {

    // Redirigimos el navegador a la ruta especificada
    window.location.href = path;
}