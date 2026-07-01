function AuthButton({
  children,
  className = '',
  type = 'button',
  onClick,
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`auth-button ${disabled ? 'auth-button-disabled' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export default AuthButton;
