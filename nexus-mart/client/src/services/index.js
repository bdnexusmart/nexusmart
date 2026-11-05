import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

export const productService = {
  list: (params) => api.get("/products", { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  myProducts: () => api.get("/products/vendor/mine"),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  adminAll: () => api.get("/products/admin/all"),
  approve: (id, isApproved) => api.put(`/products/admin/${id}/approve`, { isApproved }),
};

export const categoryService = {
  list: () => api.get("/categories"),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const vendorService = {
  list: () => api.get("/vendors"),
  getBySlug: (slug) => api.get(`/vendors/${slug}`),
  myProfile: () => api.get("/vendors/me"),
  updateProfile: (data) => api.put("/vendors/me", data),
  dashboard: () => api.get("/vendors/me/dashboard"),
  adminAll: (status) => api.get("/vendors/admin/all", { params: { status } }),
  adminSetStatus: (id, status) => api.put(`/vendors/admin/${id}/status`, { status }),
};

export const cartService = {
  get: () => api.get("/cart"),
  addItem: (data) => api.post("/cart/items", data),
  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete("/cart"),
};

export const orderService = {
  create: (data) => api.post("/orders", data),
  mine: () => api.get("/orders/mine"),
  getById: (id) => api.get(`/orders/${id}`),
  vendorOrders: () => api.get("/orders/vendor/mine"),
  updateItemStatus: (orderId, itemId, status) =>
    api.put(`/orders/${orderId}/items/${itemId}/status`, { status }),
  adminAll: () => api.get("/orders/admin/all"),
  adminUpdatePaymentStatus: (id, paymentStatus) =>
    api.put(`/orders/admin/${id}/payment-status`, { paymentStatus }),
};

export const userService = {
  updateProfile: (data) => api.put("/users/profile", data),
  addAddress: (data) => api.post("/users/addresses", data),
  adminList: (role) => api.get("/users", { params: { role } }),
  adminSetStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
};

export const reviewService = {
  list: (productId) => api.get(`/reviews/product/${productId}`),
  create: (productId, data) => api.post(`/reviews/product/${productId}`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
};
