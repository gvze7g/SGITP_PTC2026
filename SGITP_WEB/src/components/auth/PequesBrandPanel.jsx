import { useTheme } from '../../context/ThemeContext';

function PequesBrandPanel() {
  const { theme } = useTheme();

  return (
    <section className="auth-brand-panel" aria-label="Peques">
      <img
        className="peques-logo-image"
        src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
        alt="Peques"
      />
    </section>
  );
}

export default PequesBrandPanel;
