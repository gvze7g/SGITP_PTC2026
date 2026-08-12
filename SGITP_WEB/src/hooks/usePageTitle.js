import { useEffect } from 'react';

function usePageTitle(title) {
  useEffect(() => {
    // Centraliza los títulos públicos para evitar nombres por defecto de Vite,
    // React o localhost en la pestaña del navegador.
    document.title = title ? `${title} | Peques` : 'Peques';
  }, [title]);
}

export default usePageTitle;
