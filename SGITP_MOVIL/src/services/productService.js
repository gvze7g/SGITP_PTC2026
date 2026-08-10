import { request } from './apiClient';

// Llamadas al backend relacionadas a los productos (catálogo de la tienda).
export const productService = {
  // Trae todos los productos.
  getProducts() {
    return request('/products/catalog', { method: 'GET' });
  },

  // Trae un producto específico por su id.
  getProductById(id) {
    return request(`/products/catalog/${id}`, { method: 'GET' });
  },
};
