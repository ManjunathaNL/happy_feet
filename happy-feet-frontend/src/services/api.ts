import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// 2. Export the root URL for images (removes the '/api' at the end)
export const IMAGE_BASE_URL = API_URL.replace(/\/api$/, "") + "/";

const api = axios.create({
  baseURL: API_URL,
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

const createMasterAPI = (endpoint: string) => ({
  getAll: () => api.get(`/masters/${endpoint}`),
  getById: (id: string) => api.get(`/masters/${endpoint}/${id}`),
  create: (data: any) => api.post(`/masters/${endpoint}`, data),
  update: (id: string, data: any) => api.put(`/masters/${endpoint}/${id}`, data),
  delete: (id: string) => api.delete(`/masters/${endpoint}/${id}`),
});

export const masterAPI = {
  store: createMasterAPI("stores"),
  brand: createMasterAPI("brands"),
  category: createMasterAPI("categories"),
  subCategory: createMasterAPI("subcategories"),
  attributeType: createMasterAPI("attributetypes"),
  globalAttribute: createMasterAPI("globalattributes"),
  banner: createMasterAPI("banners"),
};

// --- ISOLATED CORE PRODUCTS & VARIANT MATRICES ENGINE ENGINE ---
export const catalogAPI = {
  getProducts: () => api.get("/products"),
  getProductById: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post("/products", data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),

  // Separate Dynamic Variant Queries Core Engine
  getVariantsByProductId: (productId: string) => api.get(`/products/variants/query?productId=${productId}`),
  createVariant: (data: any) => api.post("/products/variants", data),
  deleteVariant: (id: string) => api.delete(`/products/variants/${id}`),
};


// --- INVENTORY MANAGEMENT ENGINE ---
export const inventoryAPI = {
  getAll: () => api.get("/inventory"),
  updateStock: (data: { variantId: string, nextStockCount: number, adjustmentsReason: string }) => 
    api.put("/inventory/update-stock", data),
};

export default api;