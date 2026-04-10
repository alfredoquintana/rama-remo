import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

const DAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
};

type CalendarDay = {
  value: string;
  dayNumber: number;
  isCurrentMonth: boolean;
};

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  required = false,
  disabled = false,
  min,
  max,
  className = '',
}: DatePickerFieldProps) {
  const generatedId = useId();
  const popoverId = `${generatedId}-calendar`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(parseIsoDate(value) ?? new Date()),
  );
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayValue = useMemo(() => formatIsoDate(today), [today]);
  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    setVisibleMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  const displayValue = selectedDate ? formatDisplayDate(selectedDate) : '';
  const fieldClassName = ['form-field', className].filter(Boolean).join(' ');

  const closePopover = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const applyDate = (nextDate: Date) => {
    const normalizedDate = startOfDay(nextDate);
    const normalizedValue = formatIsoDate(normalizedDate);

    if (!isWithinRange(normalizedValue, min, max)) {
      return;
    }

    onChange(normalizedValue);
    setVisibleMonth(startOfMonth(normalizedDate));
    setIsOpen(false);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setVisibleMonth(startOfMonth(selectedDate ?? new Date()));
      setIsOpen(true);
    }
  };

  return (
    <label className={fieldClassName}>
      <span>{label}</span>

      <div
        ref={containerRef}
        className={`date-picker${isOpen ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`}
      >
        <button
          ref={triggerRef}
          aria-controls={popoverId}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className={`date-picker__trigger${value ? ' has-value' : ''}`}
          disabled={disabled}
          type="button"
          onClick={() => {
            setVisibleMonth(startOfMonth(selectedDate ?? new Date()));
            setIsOpen((current) => !current);
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={`date-picker__value${value ? '' : ' is-placeholder'}`}>
            {displayValue || placeholder}
          </span>
          <CalendarIcon />
        </button>

        {isOpen ? (
          <div
            aria-label={`${label}: selector de fecha`}
            className="date-picker__popover"
            id={popoverId}
            role="dialog"
          >
            <div className="date-picker__header">
              <button
                aria-label="Mes anterior"
                className="date-picker__nav"
                type="button"
                onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
              >
                <ChevronLeftIcon />
              </button>

              <strong className="date-picker__month-label">
                {MONTH_LABELS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </strong>

              <button
                aria-label="Mes siguiente"
                className="date-picker__nav"
                type="button"
                onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
              >
                <ChevronRightIcon />
              </button>
            </div>

            <div className="date-picker__weekdays">
              {DAY_LABELS.map((dayLabel) => (
                <span key={dayLabel}>{dayLabel}</span>
              ))}
            </div>

            <div className="date-picker__grid">
              {calendarDays.map((calendarDay) => {
                const isSelected = calendarDay.value === value;
                const isToday = calendarDay.value === todayValue;
                const isInRange = isWithinRange(calendarDay.value, min, max);
                const isDisabled = !isInRange;

                return (
                  <button
                    key={calendarDay.value}
                    aria-pressed={isSelected}
                    className={`date-picker__day${calendarDay.isCurrentMonth ? '' : ' is-outside'}${isInRange ? ' is-in-range' : ''}${isSelected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}`}
                    disabled={isDisabled}
                    type="button"
                    onClick={() => applyDate(parseIsoDate(calendarDay.value) ?? today)}
                  >
                    {calendarDay.dayNumber}
                  </button>
                );
              })}
            </div>

            <div className="date-picker__footer">
              {min || max ? (
                <span className="date-picker__range-hint">
                  {min && max
                    ? min === max
                      ? `Solo ${formatDisplayDate(parseIsoDate(min) ?? today)}`
                      : `${formatDisplayDate(parseIsoDate(min) ?? today)} a ${formatDisplayDate(parseIsoDate(max) ?? today)}`
                    : min
                      ? `Desde ${formatDisplayDate(parseIsoDate(min) ?? today)}`
                      : `Hasta ${formatDisplayDate(parseIsoDate(max ?? todayValue) ?? today)}`}
                </span>
              ) : null}

              <button
                className="date-picker__action"
                type="button"
                onClick={() => applyDate(today)}
              >
                Hoy
              </button>

              {!required ? (
                <button
                  className="date-picker__action"
                  type="button"
                  onClick={() => {
                    onChange('');
                    closePopover();
                  }}
                >
                  Limpiar
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </label>
  );
}

function buildCalendarDays(monthDate: Date) {
  const firstDayOfMonth = startOfMonth(monthDate);
  const offset = (firstDayOfMonth.getDay() + 6) % 7;
  const firstCalendarDate = addDays(firstDayOfMonth, -offset);

  return Array.from({ length: 42 }, (_, index): CalendarDay => {
    const currentDate = addDays(firstCalendarDate, index);

    return {
      value: formatIsoDate(currentDate),
      dayNumber: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === firstDayOfMonth.getMonth(),
    };
  });
}

function parseIsoDate(value: string) {
  const match = value.match(DATE_ONLY_PATTERN);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() !== Number(month) - 1 ||
    parsedDate.getDate() !== Number(day)
  ) {
    return null;
  }

  return startOfDay(parsedDate);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return startOfDay(nextDate);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTH_LABELS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

function isWithinRange(value: string, min?: string, max?: string) {
  if (min && value < min) {
    return false;
  }

  if (max && value > max) {
    return false;
  }

  return true;
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="date-picker__icon" viewBox="0 0 24 24">
      <path
        d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8ZM6 6a1 1 0 0 0-1 1v1h15V7a1 1 0 0 0-1-1H6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" className="date-picker__chevron" viewBox="0 0 20 20">
      <path
        d="M11.8 4.6a1 1 0 0 1 0 1.4L7.8 10l4 4a1 1 0 1 1-1.4 1.4l-4.7-4.7a1 1 0 0 1 0-1.4l4.7-4.7a1 1 0 0 1 1.4 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" className="date-picker__chevron" viewBox="0 0 20 20">
      <path
        d="M8.2 4.6a1 1 0 0 1 1.4 0l4.7 4.7a1 1 0 0 1 0 1.4l-4.7 4.7a1 1 0 1 1-1.4-1.4l4-4-4-4a1 1 0 0 1 0-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}
