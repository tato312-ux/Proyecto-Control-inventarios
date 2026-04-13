const API_URL = "http://localhost:4000/api";

function getHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Revisa que el backend siga encendido.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Error en la solicitud");
  }

  return data;
}
