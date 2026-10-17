// Lista cerrada de categorías de ropa de bebé. Antes la categoría se
// escribía a mano en el panel y un error de dedo ("Bodys", "Body ") creaba
// un filtro duplicado en la web y la app. Ahora el panel solo deja elegir de
// esta lista y el backend rechaza cualquier valor que no esté aquí.
export const PRODUCT_CATEGORY_GROUPS = [
  {
    group: "Niña",
    categories: [
      "Vestidos niña",
      "Bodies niña",
      "Conjuntos niña",
      "Enterizos niña",
      "Pijamas niña",
      "Blusas niña",
      "Faldas niña",
      "Pantalones niña",
      "Shorts niña",
    ],
  },
  {
    group: "Niño",
    categories: [
      "Bodies niño",
      "Conjuntos niño",
      "Enterizos niño",
      "Pijamas niño",
      "Camisas niño",
      "Pantalones niño",
      "Shorts niño",
      "Overoles niño",
    ],
  },
  {
    group: "Unisex",
    categories: [
      "Mamelucos",
      "Baberos",
      "Gorros",
      "Calcetines",
      "Zapatitos",
      "Mantas",
      "Accesorios",
    ],
  },
];

export const PRODUCT_CATEGORIES = PRODUCT_CATEGORY_GROUPS.flatMap((group) => group.categories);

export function isValidCategory(value) {
  return PRODUCT_CATEGORIES.includes(String(value ?? ""));
}
