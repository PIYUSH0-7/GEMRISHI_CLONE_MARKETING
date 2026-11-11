import axios from "axios";

// Base URL for admin API
const API_URL = import.meta.env.VITE_URL || "http://localhost:7788/api/v1";

// The rest of the admin app authenticates with the httpOnly cookie set at admin login
// (credentials: "include"). So we send the cookie and do NOT attach an Authorization
// header from localStorage - a stale "token"/"accessToken" belonging to a retailer or
// customer login would be rejected by the backend as "Not authorized as admin".
const getAuthHeaders = () => ({
  withCredentials: true,
});

export const getAbandonedCheckouts = async (token, params = {}) => {
  // params: { search, status, stage, sort, page, limit }
  const response = await axios.get(
    `${API_URL}/admin/abandoned-checkouts`,
    {
      ...getAuthHeaders(token),
      params,
    }
  );
  return response.data; // { success, data, pagination, totalAbandonedValue }
};

export const getAbandonedCheckoutById = async (token, id) => {
  const response = await axios.get(
    `${API_URL}/admin/abandoned-checkouts/${id}`,
    getAuthHeaders(token)
  );
  return response.data;
};

export const markAbandonedCheckoutResolved = async (token, id, isResolved = true) => {
  const response = await axios.patch(
    `${API_URL}/admin/abandoned-checkouts/${id}/resolve`,
    { isResolved },
    getAuthHeaders(token)
  );
  return response.data;
};

// Triggers a browser download of the CSV, respecting current filters.
export const exportAbandonedCheckoutsCsv = async (token, params = {}) => {
  const response = await axios.get(
    `${API_URL}/admin/abandoned-checkouts/export/csv`,
    {
      ...getAuthHeaders(token),
      params,
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `abandoned-checkouts-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};