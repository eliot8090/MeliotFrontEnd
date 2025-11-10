// URL base del backend Spring Boot
const BASE_URL = "http://localhost:8080/api";

/* ===== GET genérico ===== */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const fullUrl = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(fullUrl, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = `Error en la petición GET a ${endpoint}. Estado: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        /* ignorar si no hay JSON */
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("❌ Error en apiGet:", error);
    throw new Error("Error al conectar con el servidor."); // mensaje uniforme
  }
}

/* ===== POST / PUT / DELETE genérico ===== */
type HttpMethod = "POST" | "PUT" | "DELETE";

export async function apiRequest<T, B = any>(
  endpoint: string,
  method: HttpMethod,
  body?: B
): Promise<T> {
  const fullUrl = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(fullUrl, config);

    if (response.status === 204) return null as T;

    if (!response.ok) {
      let errorMessage = `Error en la petición ${method} a ${endpoint}. Estado: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        /* ignorar si no hay JSON */
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`❌ Error en apiRequest (${method}):`, error);
    throw new Error("Error al conectar con el servidor.");
  }
}
