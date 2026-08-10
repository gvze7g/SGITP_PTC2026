import { Baby, Gem, Shirt, ShoppingBag } from 'lucide-react-native';

// Elige un ícono según palabras dentro del nombre de la categoría. Como las
// categorías reales las define quien sube los productos (no son fijas),
// esto es solo una ayuda visual, no una lista cerrada.
export function getCategoryIcon(category = '') {
  const value = category.toLowerCase();
  if (value.includes('nacido') || value.includes('bebé') || value.includes('baby')) return Baby;
  if (value.includes('body') || value.includes('ropa') || value.includes('conjunto')) return Shirt;
  if (value.includes('accesorio')) return Gem;
  return ShoppingBag;
}
