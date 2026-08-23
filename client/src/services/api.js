// Thin fetch wrapper around the (not-yet-built) Forma AI backend.
// Base URL can be overridden with VITE_API_URL; defaults to same-origin /api
// so it works once the Express server is proxied or served together.
const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // response wasn't JSON; keep the default message
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export function fetchFormSchema(formId) {
  return request(`/forms/${formId}`);
}

export function submitFormResponse(formId, values) {
  return request(`/forms/${formId}/responses`, {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export async function extractFormValues(formId, text) {
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return handle(res);
}

export async function fetchForms() {
  const res = await fetch(`${API_BASE_URL}/forms`);
  return handle(res);
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/forms/stats`);
  return handle(res);
}

export async function checkHealth() {
  const healthUrl = API_BASE_URL.replace(/\/api$/, "/health");
  const start = performance.now();
  const res = await fetch(healthUrl);
  const ms = Math.round(performance.now() - start);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return { ...(await res.json()), latencyMs: ms };
}

export async function seedDemoForm() {
  const res = await fetch(`${API_BASE_URL}/forms/seed-demo`, { method: "POST" });
  return handle(res);
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE_URL}/forms/demo-data`, { method: "DELETE" });
  return handle(res);
}

export async function exportResponsesCsv() {
  const res = await fetch(`${API_BASE_URL}/forms/export`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Export failed: ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "forma-ai-responses.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}