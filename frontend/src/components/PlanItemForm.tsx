import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  planningItemPriorityLabels,
  planningItemStatusLabels,
} from '../app/labels';
import { StatusMessage } from './StatusMessage';
import type {
  AnnualPlanArea,
  PlanningItemPayload,
  PlanningItemPriority,
  PlanningItemStatus,
} from '../types/planning';
import type { User } from '../types/users';

export type PlanItemFormValues = {
  idAreaPlan: string;
  idResponsable: string;
  titulo: string;
  descripcion: string;
  resultadoEsperado: string;
  prioridad: PlanningItemPriority;
  estado: PlanningItemStatus;
  fechaPlanificada: string;
  fechaCumplimientoReal: string;
  resumenFinal: string;
};

type PlanItemFormProps = {
  areas: AnnualPlanArea[];
  users: User[];
  initialValues: PlanItemFormValues;
  successMessage?: string;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (payload: PlanningItemPayload) => Promise<void>;
  onCancel?: () => void;
};

const planningPriorities: PlanningItemPriority[] = ['alta', 'media', 'baja'];
const planningStates: PlanningItemStatus[] = [
  'pendiente',
  'en_curso',
  'cumplido',
  'parcialmente_cumplido',
  'no_cumplido',
  'cancelado',
];

export function PlanItemForm({
  areas,
  users,
  initialValues,
  successMessage,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: PlanItemFormProps) {
  const [values, setValues] = useState<PlanItemFormValues>(initialValues);
  const [localError, setLocalError] = useState('');

  const handleChange =
    (field: keyof PlanItemFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const areaId = Number(values.idAreaPlan);
    const titulo = values.titulo.trim();
    const descripcion = values.descripcion.trim();
    const resultadoEsperado = values.resultadoEsperado.trim();

    if (!areaId) {
      setLocalError('Debes seleccionar un área.');
      return;
    }

    if (!titulo) {
      setLocalError('Debes ingresar un título para el ítem.');
      return;
    }

    if (!descripcion) {
      setLocalError('Debes ingresar una descripción para el ítem.');
      return;
    }

    if (!resultadoEsperado) {
      setLocalError('Debes ingresar el resultado esperado.');
      return;
    }

    if (!values.fechaPlanificada) {
      setLocalError('Debes ingresar una fecha planificada.');
      return;
    }

    setLocalError('');

    await onSubmit({
      idAreaPlan: areaId,
      idResponsable: values.idResponsable ? Number(values.idResponsable) : null,
      titulo,
      descripcion,
      resultadoEsperado,
      prioridad: values.prioridad,
      estado: values.estado,
      fechaPlanificada: values.fechaPlanificada,
      fechaCumplimientoReal: values.fechaCumplimientoReal || undefined,
      resumenFinal: values.resumenFinal.trim() || undefined,
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
          <span>Área</span>
          <select value={values.idAreaPlan} onChange={handleChange('idAreaPlan')}>
            {areas.map((area) => (
              <option key={area.idAreaPlan} value={area.idAreaPlan}>
                {area.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Responsable</span>
          <select value={values.idResponsable} onChange={handleChange('idResponsable')}>
            <option value="">Sin asignar</option>
            {users.map((user) => (
              <option key={user.idUsuario} value={user.idUsuario}>
                {user.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field form-field--full">
          <span>Título</span>
          <input required value={values.titulo} onChange={handleChange('titulo')} />
        </label>

        <label className="form-field form-field--full">
          <span>Descripción</span>
          <textarea
            required
            rows={3}
            value={values.descripcion}
            onChange={handleChange('descripcion')}
          />
        </label>

        <label className="form-field form-field--full">
          <span>Resultado esperado</span>
          <textarea
            required
            rows={3}
            value={values.resultadoEsperado}
            onChange={handleChange('resultadoEsperado')}
          />
        </label>

        <label className="form-field">
          <span>Prioridad</span>
          <select value={values.prioridad} onChange={handleChange('prioridad')}>
            {planningPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {planningItemPriorityLabels[priority]}
              </option>
            ))}
          </select>
        </label>

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
          <span>Fecha planificada</span>
          <input
            required
            type="date"
            value={values.fechaPlanificada}
            onChange={handleChange('fechaPlanificada')}
          />
        </label>

        <label className="form-field">
          <span>Fecha de cumplimiento real</span>
          <input
            type="date"
            value={values.fechaCumplimientoReal}
            onChange={handleChange('fechaCumplimientoReal')}
          />
        </label>

        <label className="form-field form-field--full">
          <span>Resumen final</span>
          <textarea
            rows={3}
            value={values.resumenFinal}
            onChange={handleChange('resumenFinal')}
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
