
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function checkHealth() {
  return apiRequest("/health");
}

export async function getCurrentUser() {
  let response;
  try {
    response = await apiFetch("/auth/me");
  } catch {
    throw new Error(
      "Cannot connect to the backend. Please check that the FastAPI server is running."
    );
  }
  if (response.status === 401) {
    return null;
  }
  return readResponse(response);
}

export function signIn(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
}

export function signUp(email, password) {
  return apiRequest("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
}

export function signOut() {
  return apiRequest("/auth/logout", { method: "POST" });
}

// Common API request handler
async function apiRequest(endpoint, options = {}) {
  let response;

  try {
    response = await apiFetch(endpoint, options);
  } catch {
    throw new Error(
      "Cannot connect to the backend. Please check that the FastAPI server is running."
    );
  }

  if (
    response.status === 401 &&
    !endpoint.startsWith("/auth/")
  ) {
    window.dispatchEvent(new Event("armourwatch:session-expired"));
  }

  return readResponse(response);
}

function apiFetch(endpoint, options = {}) {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
  });
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : detail || "Something went wrong.";

    throw new Error(message);
  }

  return data;
}

// Register a new armour panel
export function registerPanel(panelData) {
  return apiRequest("/panels/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(panelData),
  });
}

// Get a panel by its Panel ID
export function getPanel(panelId) {
  return apiRequest(`/panels/${encodeURIComponent(panelId)}`);
}

// Get all registered panels
export function getPanels() {
  return apiRequest("/panels/");
}

// Create a new inspection
export function createInspection(inspectionData) {
  return apiRequest("/inspections/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inspectionData),
  });
}

// Get all inspections
export function getInspections() {
  return apiRequest("/inspections/");
}

// Get one inspection
export function getInspection(inspectionId) {
  return apiRequest(`/inspections/${inspectionId}`);
}

// Upload front or back armour image
export function uploadInspectionImage(inspectionId, surface, file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(
    `/inspections/${inspectionId}/upload/${surface}`,
    {
      method: "POST",
      body: formData,
    }
  );
}
