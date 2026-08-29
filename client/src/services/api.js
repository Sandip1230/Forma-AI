// Thin fetch wrapper around the Forma AI backend.
// Base URL can be overridden with VITE_API_URL; defaults to same-origin /api
// so it works once the Express server is proxied or served together.
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      // errorHandler.js sends { error }, not { message } — matching the
      // actual shape so failures surface the real reason instead of falling
      // through to the generic status-code message below.
      if (body?.error) message = body.error;
    } catch {
      // response wasn't JSON; keep the default message
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export function signup(username, email, password) {
  return request("/auth/signup", { method: "POST", body: JSON.stringify({ username, email, password }) });
}

export function verifySignupOtp(email, code) {
  return request("/auth/verify-signup-otp", { method: "POST", body: JSON.stringify({ email, code }) });
}

export function login(identifier, password) {
  return request("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) });
}

export function forgotPassword(email) {
  return request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

export function resetPassword(email, code, newPassword) {
  return request("/auth/reset-password", { method: "POST", body: JSON.stringify({ email, code, newPassword }) });
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function fetchMe() {
  return request("/auth/me");
}

export function createSchema(formId, title, fields) {
  return request("/forms", { method: "POST", body: JSON.stringify({ formId, title, fields }) });
}

export function fetchFormResponses(formId) {
  return request(`/forms/${formId}/responses`);
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

export function extractFormValues(formId, text) {
  return request(`/forms/${formId}/extract`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function fetchForms() {
  return request("/forms");
}

export function fetchDashboardStats() {
  return request("/forms/stats");
}

export async function checkHealth() {
  const healthUrl = API_BASE_URL.replace(/\/api$/, "/health");
  const start = performance.now();
  const res = await fetch(healthUrl);
  const ms = Math.round(performance.now() - start);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return { ...(await res.json()), latencyMs: ms };
}

export function seedDemoForm() {
  return request("/forms/seed-demo", { method: "POST" });
}

export function resetDemoData() {
  return request("/forms/demo-data", { method: "DELETE" });
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

export async function fetchDraft(formId, draftId) {
  // A 404 here means "no saved draft yet" — expected, not an error, so it's
  // checked before going through request()'s throw-on-!ok path.
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/draft/${draftId}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function saveDraft(formId, draftId, values) {
  return request(`/forms/${formId}/draft/${draftId}`, {
    method: "PUT",
    body: JSON.stringify({ values }),
  });
}

export function deleteDraft(formId, draftId) {
  return request(`/forms/${formId}/draft/${draftId}`, { method: "DELETE" });
}