// URL base del backend Spring Boot
const BASE_URL = 'http://localhost:8080/api';


// Función genérica para GET

export async function apiGet<T>(endpoint: string): Promise<T> {
    // Asegura que el endpoint empiece con "/"
    const fullUrl = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
        const response = await fetch(fullUrl);

        if (!response.ok) {
            let errorMessage = `Error en la petición GET a ${endpoint}. Estado: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // Si la respuesta no es JSON, ignoramos
            }
            throw new Error(errorMessage);
        }

        // Si todo salió bien, parseamos JSON
        return response.json() as Promise<T>;
    } catch (error) {
        console.error("❌ Error en apiGet:", error);
        throw error;
    }
}


// Función genérica para POST / PUT / DELETE


type HttpMethod = 'POST' | 'PUT' | 'DELETE';

export async function apiRequest<T, B = any>(
    endpoint: string,
    method: HttpMethod,
    body?: B
): Promise<T> {
    const fullUrl = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    try {
        const response = await fetch(fullUrl, config);

        // Caso especial: DELETE → 204 No Content
        if (response.status === 204) {
            return null as T;
        }

        if (!response.ok) {
            let errorMessage = `Error en la petición ${method} a ${endpoint}. Estado: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // ignorar si no hay JSON
            }
            throw new Error(errorMessage);
        }

        // Si la respuesta tiene cuerpo, parseamos JSON
        return response.json() as Promise<T>;
    } catch (error) {
        console.error(`❌ Error en apiRequest (${method}):`, error);
        throw error;
    }
}
