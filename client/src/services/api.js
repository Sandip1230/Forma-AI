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