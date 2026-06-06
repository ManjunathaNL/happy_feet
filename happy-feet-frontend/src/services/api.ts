



import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  
});

// Interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hf_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add this directly inside your existing api.ts file under your auth endpoints:
export const authAPI = {
  resetPassword: (token: string, data: any) => api.post(`/auth/reset-password/${token}`, data),
};

// Optional: Response interceptor for common error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hf_token");
      // You can dispatch logout action here if using Redux
      console.error("Session expired. Please login again.");
    }
    return Promise.reject(error);
  }
);

// --- USER REPOSITORY CALLS ---
export const userAPI = {
  getAll: () => api.get("/users"),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post("/users", data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// --- ROLE RBAC ---
export const roleAPI = {
  getAll: () => api.get("/roles"),
  create: (data: any) => api.post("/roles", data),
  update: (id: string, data: any) => api.put(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
};

// --- ROUTE MANAGEMENT ---
export const routeAPI = {
  getAll: () => api.get("/routes"),
  create: (data: any) => api.post("/routes", data),
  update: (id: string, data: any) => api.put(`/routes/${id}`, data),
  delete: (id: string) => api.delete(`/routes/${id}`),
};

// Add these directly to your existing api.ts file:

export const mappingAPI = {
  getByRole: (roleId: string) => api.get(`/role-route-mappings/role/${roleId}`),
  assign: (roleId: string, routeIds: string[]) => api.post('/role-route-mappings', { roleId, routeIds }),
  getAll: () => api.get('/role-route-mappings'),
  delete: (id: string) => api.delete(`/role-route-mappings/${id}`),
};

// --- CATALOG & INVENTORY ---
export const catalogAPI = {
  getBrands: () => api.get("/brands"),
  createBrand: (data: any) => api.post("/brands", data),

  getCategories: () => api.get("/categories"),
  createCategory: (data: any) => api.post("/categories", data),

  getProducts: () => api.get("/products"),
  createProduct: (data: any) => api.post("/products", data),

  getVariants: (productId: string) => api.get(`/products/${productId}/variants`),
  createVariant: (data: any) => api.post("/products/variants", data),

  getInventory: () => api.get("/inventory"),
  updateStock: (data: any) => api.post("/inventory/adjust", data),
};

export default api;