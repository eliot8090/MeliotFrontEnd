// URL base de la API
const BASE_URL = 'http://localhost:8080/api'; 

// Función Genérica para GET

export async function apiGet<T>(endpoint: string): Promise<T> {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);

        if (!response.ok) {
            // Manejo de errores HTTP (400, 404, 500, etc.)
            const errorData = await response.json();
            throw new Error(errorData.message || `Error en la petición GET a ${endpoint}. Estado: ${response.status}`);
        }

        return response.json() as Promise<T>;
    } catch (error) {
        // Manejo de errores de red o la excepción lanzada anteriormente
        console.error("Error en apiGet:", error);
        throw error;
    }
}

// Función Genérica para POST/PUT/DELETE

type HttpMethod = 'POST' | 'PUT' | 'DELETE';

export async function apiRequest<T, B = any>(
    endpoint: string, 
    method: HttpMethod, 
    body?: B
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        // Si la respuesta es 204 No Content devuelve null
        if (response.status === 204) {
             return null as T; // Usar 'null as T' para indicar que no hay cuerpo.
        }

        if (!response.ok) {
            // Manejo de errores de la API (incluye errores de autenticación/validación)
            const errorData = await response.json();
            throw new Error(errorData.message || `Error en la petición ${method} a ${endpoint}. Estado: ${response.status}`);
        }

        // Parsea el JSON 
        return response.json() as Promise<T>;
    } catch (error) {
        console.error(`Error en apiRequest (${method}):`, error);
        throw error;
    }
}