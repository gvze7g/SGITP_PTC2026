import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

function CustomDropdown({
  label,
  value,
  options = [],
  onChange,
  placeholder = "Seleccionar",
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (nextValue) => {
    onChange?.(nextValue);
    setOpen(false);
  };

  return (
    <div className={`app-field-group ${className}`}>
      {label ? <label>{label}</label> : null}

      <div
        ref={wrapperRef}
        className={`app-dropdown ${disabled ? "is-disabled" : ""} ${open ? "is-open" : ""}`}
      >
        <button
          type="button"
          className="app-dropdown-trigger"
          onClick={() => !disabled && setOpen((prev) => !prev)}
          disabled={disabled}
        >
          <span className={selectedOption ? "has-value" : "is-placeholder"}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown size={18} className="app-dropdown-icon" />
        </button>

        <AnimatePresence>
          {open && !disabled ? (
            <motion.div
              className="app-dropdown-menu"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`app-dropdown-item ${isSelected ? "is-selected" : ""}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span>{option.label}</span>
                    {isSelected ? <Check size={16} /> : null}
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CustomDropdown;