import { createContext, useCallback, useContext, useRef, useState } from 'react';

import { Toast } from '../components/Toast';

// Caja donde vive la función para mostrar avisos (toasts), accesible desde
// cualquier pantalla con el hook useToast() de abajo.
const ToastContext = createContext(null);

// Envuelve la app y dibuja el aviso (Toast) encima de todo lo demás.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, message: '', tone: 'error' });
  const hideTimeout = useRef(null);

  // Muestra un mensaje por 2.6 segundos y luego lo oculta solo.
  // tone puede ser 'success' (verde) o 'error' (rojo).
  const showToast = useCallback((message, tone = 'error') => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    setToast({ visible: true, message, tone });

    hideTimeout.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast visible={toast.visible} message={toast.message} tone={toast.tone} />
    </ToastContext.Provider>
  );
}

// Hook para mostrar avisos desde cualquier pantalla, ej:
// const { showToast } = useToast();
// showToast('Guardado con éxito', 'success');
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
