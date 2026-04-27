import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

type TimePickerFieldProps = {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  minuteStep?: number;
};

type TimeSelection = {
  hour: number;
  minute: number;
};

export function TimePickerField({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar hora',
  required = false,
  disabled = false,
  className = '',
  minuteStep = 5,
}: TimePickerFieldProps) {
  const generatedId = useId();
  const popoverId = `${generatedId}-time`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const parsedValue = useMemo(() => parseTime(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [draftSelection, setDraftSelection] = useState<TimeSelection | null>(
    parsedValue ?? getCurrentTimeSelection(minuteStep),
  );
  const minuteOptions = useMemo(
    () => buildMinuteOptions(minuteStep, parsedValue?.minute ?? null),
    [minuteStep, parsedValue?.minute],
  );
  const fieldClassName = ['form-field', className].filter(Boolean).join(' ');

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

  const displayValue = parsedValue ? formatTimeSelection(parsedValue) : '';

  const openPopover = () => {
    if (disabled) {
      return;
    }

    setDraftSelection(parsedValue ?? getCurrentTimeSelection(minuteStep));
    setIsOpen(true);
  };

  const closePopover = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const applySelection = (selection: TimeSelection | null) => {
    if (!selection) {
      return;
    }

    onChange(formatTimeSelection(selection));
    setIsOpen(false);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPopover();
    }
  };

  return (
    <label className={fieldClassName}>
      <span>{label}</span>

      <div
        ref={containerRef}
        className={`time-picker${isOpen ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`}
      >
        <button
          ref={triggerRef}
          aria-controls={popoverId}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className={`time-picker__trigger${value ? ' has-value' : ''}`}
          disabled={disabled}
          type="button"
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              return;
            }

            openPopover();
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={`time-picker__value${value ? '' : ' is-placeholder'}`}>
            {displayValue || placeholder}
          </span>
          <ClockIcon />
        </button>

        {isOpen ? (
          <div
            aria-label={`${label}: selector de hora`}
            className="time-picker__popover"
            id={popoverId}
            role="dialog"
          >
            <div className="time-picker__header">
              <strong className="time-picker__title">Selecciona una hora</strong>
              <span className="time-picker__preview">
                {draftSelection ? formatTimeSelection(draftSelection) : '--:--'}
              </span>
            </div>

            <div className="time-picker__columns">
              <div className="time-picker__column">
                <span className="time-picker__column-label">Hora</span>
                <div className="time-picker__options">
                  {Array.from({ length: 24 }, (_, index) => index).map((hour) => (
                    <button
                      key={hour}
                      aria-pressed={draftSelection?.hour === hour}
                      className={`time-picker__option${draftSelection?.hour === hour ? ' is-selected' : ''}`}
                      type="button"
                      onClick={() =>
                        setDraftSelection((current) => ({
                          hour,
                          minute: current?.minute ?? minuteOptions[0],
                        }))
                      }
                    >
                      {String(hour).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="time-picker__column">
                <span className="time-picker__column-label">Minutos</span>
                <div className="time-picker__options">
                  {minuteOptions.map((minute) => (
                    <button
                      key={minute}
                      aria-pressed={draftSelection?.minute === minute}
                      className={`time-picker__option${draftSelection?.minute === minute ? ' is-selected' : ''}`}
                      type="button"
                      onClick={() =>
                        setDraftSelection((current) => ({
                          hour: current?.hour ?? 0,
                          minute,
                        }))
                      }
                    >
                      {String(minute).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="time-picker__footer">
              <button
                className="time-picker__action"
                type="button"
                onClick={() => applySelection(getCurrentTimeSelection(minuteStep))}
              >
                Ahora
              </button>

              {!required ? (
                <button
                  className="time-picker__action"
                  type="button"
                  onClick={() => {
                    onChange('');
                    closePopover();
                  }}
                >
                  Limpiar
                </button>
              ) : null}

              <button
                className="time-picker__action time-picker__action--primary"
                disabled={!draftSelection}
                type="button"
                onClick={() => applySelection(draftSelection)}
              >
                Aplicar
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </label>
  );
}

function parseTime(value: string) {
  const match = value.match(TIME_PATTERN);

  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

function formatTimeSelection(selection: TimeSelection) {
  return `${String(selection.hour).padStart(2, '0')}:${String(selection.minute).padStart(2, '0')}`;
}

function buildMinuteOptions(step: number, selectedMinute: number | null) {
  const sanitizedStep = Number.isFinite(step) && step > 0 ? Math.min(step, 60) : 5;
  const options = Array.from(
    { length: Math.ceil(60 / sanitizedStep) },
    (_, index) => index * sanitizedStep,
  ).filter((minute) => minute < 60);

  if (
    selectedMinute !== null &&
    selectedMinute >= 0 &&
    selectedMinute < 60 &&
    !options.includes(selectedMinute)
  ) {
    options.push(selectedMinute);
    options.sort((first, second) => first - second);
  }

  return options;
}

function getCurrentTimeSelection(step: number) {
  const now = new Date();
  const minutes = roundMinutes(now.getMinutes(), step);

  if (minutes === 60) {
    return {
      hour: (now.getHours() + 1) % 24,
      minute: 0,
    };
  }

  return {
    hour: now.getHours(),
    minute: minutes,
  };
}

function roundMinutes(minutes: number, step: number) {
  const sanitizedStep = Number.isFinite(step) && step > 0 ? Math.min(step, 60) : 5;
  return Math.round(minutes / sanitizedStep) * sanitizedStep;
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="time-picker__icon" viewBox="0 0 24 24">
      <path
        d="M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20Zm0 2.2a7.8 7.8 0 1 0 0 15.6a7.8 7.8 0 0 0 0-15.6Zm.1 3.1a1 1 0 0 1 1 1v3.2l2.3 1.3a1 1 0 0 1-1 1.8l-2.8-1.6a1.1 1.1 0 0 1-.6-.9V8.3a1 1 0 0 1 1.1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}
