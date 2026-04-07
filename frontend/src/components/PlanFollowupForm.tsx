import { useState, type ChangeEvent, type FormEvent } from 'react';
import { planningItemStatusLabels } from '../app/labels';
import { StatusMessage } from './StatusMessage';
import type { PlanningFollowupPayload, PlanningItemStatus } from '../types/planning';

export type PlanFollowupFormValues = {
  estado: PlanningItemStatus;
  avancePorcentaje: string;
  comentario: string;
  bloqueos: string;
  proximoPaso: string;
  funcionoBien: string;
  porMejorar: string;
};

type PlanFollowupFormProps = {
  initialValues: PlanFollowupFormValues;
  successMessage?: string;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (payload: PlanningFollowupPayload) => Promise<void>;
  onCancel?: () => void;
};

const planningStates: PlanningItemStatus[] = [
  'pendiente',
  'en_curso',
  'cumplido',
  'parcialmente_cumplido',
  'no_cumplido',
  'cancelado',
];

export function PlanFollowupForm({
  initialValues,
  successMessage,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: PlanFollowupFormProps) {
  const [values, setValues] = useState<PlanFollowupFormValues>(initialValues);
  const [localError, setLocalError] = useState('');

  const handleChange =
    (field: keyof PlanFollowupFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const avancePorcentaje = Number(values.avancePorcentaje);
    const comentario = values.comentario.trim();

    if (Number.isNaN(avancePorcentaje) || avancePorcentaje < 0 || avancePorcentaje > 100) {
      setLocalError('El avance debe estar entre 0 y 100.');
      return;
    }

    if (!comentario) {
      setLocalError('Debes ingresar un comentario de seguimiento.');
      return;
    }

    setLocalError('');

    await onSubmit({
      estado: values.estado,
      avancePorcentaje,
      comentario,
      bloqueos: values.bloqueos.trim() || undefined,
      proximoPaso: values.proximoPaso.trim() || undefined,
      funcionoBien: values.funcionoBien.trim() || undefined,
      porMejorar: values.porMejorar.trim() || undefined,
    });
  };

  return (
    <form className="subform-card" onSubmit={handleSubmit}>
      <div className="subform-card__header">
        <strong>{submitLabel}</strong>
        {onCancel ? (
          <button
            className="button button-secondary button-small"
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
        ) : null}
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span>Estado</span>
          <select value={values.estado} onChange={handleChange('estado')}>
            {planningStates.map((state) => (
              <option key={state} value={state}>
                {planningItemStatusLabels[state]}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Avance (%)</span>
          <input
            max="100"
            min="0"
            type="number"
            value={values.avancePorcentaje}
            onChange={handleChange('avancePorcentaje')}
          />
        </label>

        <label className="form-field form-field--full">
          <span>Comentario de seguimiento</span>
          <textarea
            required
            rows={3}
            value={values.comentario}
            onChange={handleChange('comentario')}
          />
        </label>

        <label className="form-field">
          <span>Bloqueos</span>
          <textarea
            rows={3}
            value={values.bloqueos}
            onChange={handleChange('bloqueos')}
          />
        </label>

        <label className="form-field">
          <span>Proximo paso</span>
          <textarea
            rows={3}
            value={values.proximoPaso}
            onChange={handleChange('proximoPaso')}
          />
        </label>

        <label className="form-field">
          <span>Que funciono bien</span>
          <textarea
            rows={3}
            value={values.funcionoBien}
            onChange={handleChange('funcionoBien')}
          />
        </label>

        <label className="form-field">
          <span>Que mejorar</span>
          <textarea
            rows={3}
            value={values.porMejorar}
            onChange={handleChange('porMejorar')}
          />
        </label>
      </div>

      {localError ? <StatusMessage kind="error" message={localError} /> : null}
      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}
      {successMessage ? <StatusMessage kind="success" message={successMessage} /> : null}

      <div className="form-actions">
        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
