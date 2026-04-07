import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AnnualPlanForm,
  type AnnualPlanFormValues,
} from '../components/AnnualPlanForm';
import { createAnnualPlan } from '../services/planning';
import type { AnnualPlanPayload } from '../types/planning';

const initialValues: AnnualPlanFormValues = {
  anio: String(new Date().getFullYear()),
  nombre: '',
  estado: 'borrador',
  objetivoGeneral: '',
  areas: [
    { nombre: 'Deportivo', descripcion: '' },
    { nombre: 'Administración', descripcion: '' },
  ],
};

export function AnnualPlanCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (values: AnnualPlanPayload) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const plan = await createAnnualPlan(values);
      navigate(`/planificacion/${plan.idPlanAnual}`, {
        state: { message: 'Plan anual creado correctamente.' },
      });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Crear plan anual</h2>
          <p>
            Define el objetivo general, las áreas y la base para dar seguimiento durante
            el año.
          </p>
        </div>
      </div>

      <AnnualPlanForm
        errorMessage={errorMessage}
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        submitLabel="Guardar plan anual"
      />
    </section>
  );
}
