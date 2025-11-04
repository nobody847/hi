const API_BASE = "/api";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    logout: () => fetchAPI("/auth/logout", { method: "POST" }),
    getStatus: () => fetchAPI("/auth/status"),
  },

  projects: {
    getAll: () => fetchAPI("/projects"),
    getById: (id: string) => fetchAPI(`/projects/${id}`),
    create: (data: any) =>
      fetchAPI("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/projects/${id}`, { method: "DELETE" }),
  },

  issues: {
    getByProject: (projectId: string) => fetchAPI(`/projects/${projectId}/issues`),
    create: (projectId: string, data: any) =>
      fetchAPI(`/projects/${projectId}/issues`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/issues/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/issues/${id}`, { method: "DELETE" }),
  },

  credentials: {
    getByProject: (projectId: string) => fetchAPI(`/projects/${projectId}/credentials`),
    create: (projectId: string, data: any) =>
      fetchAPI(`/projects/${projectId}/credentials`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/credentials/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/credentials/${id}`, { method: "DELETE" }),
  },

  team: {
    getByProject: (projectId: string) => fetchAPI(`/projects/${projectId}/team`),
    create: (projectId: string, data: any) =>
      fetchAPI(`/projects/${projectId}/team`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/team/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/team/${id}`, { method: "DELETE" }),
  },

  goals: {
    getByProject: (projectId: string) => fetchAPI(`/projects/${projectId}/goals`),
    create: (projectId: string, data: any) =>
      fetchAPI(`/projects/${projectId}/goals`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/goals/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/goals/${id}`, { method: "DELETE" }),
  },

  backup: {
    toGoogleDrive: (projectId: string) =>
      fetchAPI("/backup-to-drive", {
        method: "POST",
        body: JSON.stringify({ projectId }),
      }),
  },
};
