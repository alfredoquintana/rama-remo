import { useState, type ChangeEvent, type FormEvent } from 'react';
import { annualPlanStatusLabels } from '../app/labels';
import { StatusMessage } from './StatusMessage';
import type { AnnualPlanPayload, AnnualPlanStatus } from '../types/planning';

export type AnnualPlanFormValues = {
  anio: string;
  nombre: string;
  estado: AnnualPlanStatus;
  objetivoGeneral: string;
  areas: Array<{
    idAreaPlan?: number;
    nombre: string;
    descripcion: string;
  }>;
};

type AnnualPlanFormProps = {
  initialValues: AnnualPlanFormValues;
  successMessage?: string;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (payload: AnnualPlanPayload) => Promise<void>;
};

const annualPlanStatuses: AnnualPlanStatus[] = ['borrador', 'activo', 'cerrado'];

export function AnnualPlanForm({
  initialValues,
  successMessage,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
}: AnnualPlanFormProps) {
  const [values, setValues] = useState<AnnualPlanFormValues>(initialValues);
  const [localError, setLocalError] = useState('');

  const handleChange =
    (field: keyof Omit<AnnualPlanFormValues, 'areas'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleAreaChange =
    (index: number, field: 'nombre' | 'descripcion') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({
        ...current,
        areas: current.areas.map((area, areaIndex) =>
          areaIndex === index
            ? {
                ...area,
                [field]: event.target.value,
              }
            : area,
        ),
      }));
    };

  const addArea = () => {
    setValues((current) => ({
      ...current,
      areas: [...current.areas, { nombre: '', descripcion: '' }],
    }));
  };

  const removeArea = (index: number) => {
    setValues((current) => ({
      ...current,
      areas: current.areas.filter((_, areaIndex) => areaIndex !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const anio = Number(values.anio);
    const nombre = values.nombre.trim();
    const normalizedAreas = values.areas
      .map((area) => ({
        idAreaPlan: area.idAreaPlan,
        nombre: area.nombre.trim(),
        descripcion: area.descripcion.trim(),
      }))
      .filter((area) => area.nombre || area.descripcion);

    if (!anio) {
      setLocalError('Debes indicar un año válido para el plan.');
      return;
    }

    if (anio < 2000 || anio > 2100) {
      setLocalError('El año debe estar entre 2000 y 2100.');
      return;
    }

    if (!nombre) {
      setLocalError('Debes ingresar un nombre para el plan.');
      return;
    }

    if (normalizedAreas.length === 0) {
      setLocalError('Debes agregar al menos un área para ordenar la planificación.');
      return;
    }

    if (normalizedAreas.some((area) => !area.nombre)) {
      setLocalError('Todas las áreas deben tener nombre.');
      return;
    }

    const normalizedNames = normalizedAreas.map((area) => area.nombre.toLowerCase());

    if (new Set(normalizedNames).size !== normalizedNames.length) {
      setLocalError('No puedes repetir nombres de áreas dentro del mismo plan.');
      return;
    }

    setLocalError('');

    await onSubmit({
      anio,
      nombre,
      estado: values.estado,
      objetivoGeneral: values.objetivoGeneral.trim() || undefined,
      areas: normalizedAreas.map((area, index) => ({
        idAreaPlan: area.idAreaPlan,
        nombre: area.nombre,
        descripcion: area.descripcion || undefined,
        orden: index + 1,
      })),
    });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field">
          <span>Año</span>
          <input
            required
            max="2100"
            min="2000"
            type="number"
            value={values.anio}
            onChange={handleChange('anio')}
          />
        </label>

        <label className="form-field">
          <span>Estado</span>
          <select value={values.estado} onChange={handleChange('estado')}>
            {annualPlanStatuses.map((status) => (
              <option key={status} value={status}>
                {annualPlanStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field form-field--full">
          <span>Nombre del plan</span>
          <input
            required
            value={values.nombre}
            onChange={handleChange('nombre')}
          />
        </label>

        <label className="form-field form-field--full">
          <span>Objetivo general</span>
          <textarea
            rows={4}
            value={values.objetivoGeneral}
            onChange={handleChange('objetivoGeneral')}
          />
        </label>
      </div>

      <fieldset className="form-section">
        <div className="section-heading">
        <legend>Áreas del plan</legend>
          <button
            className="button button-secondary button-small"
            onClick={addArea}
            type="button"
          >
            Agregar área
          </button>
        </div>

        <div className="area-editor-list">
          {values.areas.map((area, index) => (
            <div key={area.idAreaPlan ?? `new-${index}`} className="subform-card">
              <div className="subform-card__header">
                <strong>Área {index + 1}</strong>
                <button
                  className="button button-secondary button-small"
                  disabled={values.areas.length === 1}
                  onClick={() => removeArea(index)}
                  type="button"
                >
                  Quitar
                </button>
              </div>

              <div className="form-grid">
                <label className="form-field">
                  <span>Nombre</span>
                  <input
                    required
                    value={area.nombre}
                    onChange={handleAreaChange(index, 'nombre')}
                  />
                </label>

                <label className="form-field">
                  <span>Descripción</span>
                  <input
                    value={area.descripcion}
                    onChange={handleAreaChange(index, 'descripcion')}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

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
