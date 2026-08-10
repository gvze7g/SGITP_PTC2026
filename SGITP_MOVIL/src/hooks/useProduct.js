import { useQuery } from '@tanstack/react-query';

import { productService } from '../services/productService';

// Trae UN producto por su id (para la pantalla de detalle).
export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.getProductById(id),
    enabled: Boolean(id), // no pide nada si todavía no hay id
  });
}
