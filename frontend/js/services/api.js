// Sentinel Research Frontend API Client
const API_BASE = window.location.origin;

window.SentinelAPI = {
  async login(identifier, password) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed");
      return data;
    } catch (err) {
      throw err;
    }
  },

  async changePassword(employee_id, new_password, confirm_password) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id, new_password, confirm_password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Password update failed");
      return data;
    } catch (err) {
      throw err;
    }
  },

  async verifyClaimedProfile(employee_id, claimed_department, claimed_role) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-claimed-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id, claimed_department, claimed_role }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (err) {
      return { ok: false, data: { error: err.message } };
    }
  },

  async runQuery(user_id, question) {
    try {
      const res = await fetch(`${API_BASE}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Query execution failed");
      return data;
    } catch (err) {
      throw err;
    }
  },

  async getAuditLogs(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.user_id) params.append("user_id", filters.user_id);
      if (filters.department) params.append("department", filters.department);
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const res = await fetch(`${API_BASE}/api/audit?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load audit logs");
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async getAuditDetail(request_id) {
    try {
      const res = await fetch(`${API_BASE}/api/audit/${encodeURIComponent(request_id)}`);
      if (!res.ok) throw new Error("Audit detail not found");
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  async getDocuments() {
    try {
      const res = await fetch(`${API_BASE}/api/documents`);
      if (!res.ok) throw new Error("Failed to load documents");
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async getEmployees() {
    try {
      const res = await fetch(`${API_BASE}/api/employees`);
      if (!res.ok) throw new Error("Failed to load employees");
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },
};
