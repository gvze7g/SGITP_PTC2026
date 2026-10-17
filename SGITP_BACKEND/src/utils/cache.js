// Caché en memoria para lecturas públicas muy pedidas (catálogo, más
// vendidos, sucursales). Cada visita al Inicio pedía todo a MongoDB; con esto
// varias visitas seguidas comparten la misma consulta. Si llegan peticiones
// iguales mientras la consulta está en curso, todas esperan esa misma.

const entries = new Map();

export async function cached(key, ttlMs, load) {
  const now = Date.now();
  const entry = entries.get(key);

  if (entry?.value !== undefined && entry.expiresAt > now) return entry.value;
  if (entry?.pending) return entry.pending;

  const pending = load()
    .then((value) => {
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .catch((error) => {
      entries.delete(key);
      throw error;
    });

  entries.set(key, { ...entry, pending });
  return pending;
}

// Se llama cuando cambian los datos (producto editado, venta que bajó el
// stock, sucursal nueva...) para que nadie vea información vieja.
export function invalidateCache(prefix) {
  for (const key of entries.keys()) {
    if (key.startsWith(prefix)) entries.delete(key);
  }
}

export const CACHE_KEYS = {
  catalog: "catalog:",
  bestSellers: "best-sellers:",
  branches: "branches:",
};
