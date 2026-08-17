import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';

function AuthInput({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  name = '',
  autoComplete = 'off',
  maxLength,
  filter,
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(value ?? '');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value);
    }
  }, [isControlled, value]);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputValue = isControlled ? value : internalValue;

  // "filter" (letras/numeros/etc, ver paginas que lo usan) limpia lo que no
  // corresponde a ese campo apenas se escribe, antes de que llegue a onChange.
  const handleChange = (event) => {
    if (filter) {
      event.target.value = filter(event.target.value);
    }

    if (!isControlled) {
      setInternalValue(event.target.value);
    }

    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className={`auth-input-wrap ${className}`}>
      {label ? <label className="auth-label">{label}</label> : null}

      <div className="auth-input-row">
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className="auth-input"
        />

        {isPassword ? (
          <button
            type="button"
            className="auth-icon-button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <EyeOff size={20} strokeWidth={1.8} />
            ) : (
              <Eye size={20} strokeWidth={1.8} />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default AuthInput;
