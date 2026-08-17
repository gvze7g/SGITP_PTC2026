import { useEffect, useRef } from 'react';

// El backend genera el codigo con crypto.randomBytes(3).toString("hex"),
// es decir 6 caracteres alfanumericos (0-9 y a-f), no solo digitos.
const ALLOWED_CHARS = /[^a-z0-9]/gi;

// Casillas de codigo OTP. Controlado por `value` (string alfanumerica);
// `focusSignal` puede cambiar para forzar el foco en la primera casilla vacia
// (por ejemplo, despues de reenviar el codigo).
function OtpInput({ length = 6, value, onChange, disabled = false, focusSignal = 0 }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (_, index) => value[index] || '');

  useEffect(() => {
    const firstEmptyIndex = digits.findIndex((digit) => !digit);
    const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    inputsRef.current[targetIndex]?.focus();
    // Solo debe re-enfocar cuando cambia la señal externa, no en cada tecleo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSignal]);

  const handleChange = (index) => (event) => {
    const cleaned = event.target.value.replace(ALLOWED_CHARS, '').toLowerCase();
    const next = digits.slice();

    if (!cleaned) {
      next[index] = '';
      onChange(next.join(''));
      return;
    }

    const chars = cleaned.split('');
    chars.forEach((char, offset) => {
      if (index + offset < length) {
        next[index + offset] = char;
      }
    });
    onChange(next.join(''));

    const nextIndex = Math.min(index + chars.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index) => (event) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = digits.slice();

      if (next[index]) {
        next[index] = '';
        onChange(next.join(''));
        return;
      }

      if (index > 0) {
        next[index - 1] = '';
        onChange(next.join(''));
        inputsRef.current[index - 1]?.focus();
      }
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData
      .getData('text')
      .replace(ALLOWED_CHARS, '')
      .toLowerCase()
      .slice(0, length);
    if (!pasted) return;

    event.preventDefault();
    onChange(pasted);

    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="otp-input-group" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          className="otp-input-box"
          type="text"
          inputMode="text"
          pattern="[a-zA-Z0-9]*"
          maxLength={1}
          value={digit}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          disabled={disabled}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Carácter ${index + 1} del código`}
        />
      ))}
    </div>
  );
}

export default OtpInput;
