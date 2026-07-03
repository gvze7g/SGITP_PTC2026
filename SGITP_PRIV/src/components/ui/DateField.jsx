import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import { getMonth, getYear } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const years = Array.from({ length: 80 }, (_, index) => getYear(new Date()) - index);

const DateInputButton = forwardRef(function DateInputButton(
  { value, onClick, placeholder, disabled },
  ref
) {
  return (
    <button
      type="button"
      className={`app-date-trigger ${disabled ? "is-disabled" : ""}`}
      onClick={onClick}
      ref={ref}
      disabled={disabled}
    >
      <span className={value ? "has-value" : "is-placeholder"}>
        {value || placeholder}
      </span>
      <Calendar size={18} className="app-date-icon" />
    </button>
  );
});

function DateField({
  label,
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  minDate,
  maxDate,
  disabled = false,
}) {
  return (
    <div className="app-field-group">
      {label ? <label>{label}</label> : null}

      <DatePicker
        selected={value}
        onChange={onChange}
        locale={es}
        dateFormat="dd/MM/yyyy"
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        calendarClassName="app-datepicker-calendar"
        popperClassName="app-datepicker-popper"
        customInput={
          <DateInputButton placeholder={placeholder} disabled={disabled} />
        }
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="app-datepicker-header">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="app-datepicker-nav"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="app-datepicker-selectors">
              <select
                className="app-datepicker-select"
                value={getMonth(date)}
                onChange={(event) => changeMonth(Number(event.target.value))}
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                className="app-datepicker-select"
                value={getYear(date)}
                onChange={(event) => changeYear(Number(event.target.value))}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="app-datepicker-nav"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      />
    </div>
  );
}

export default DateField;