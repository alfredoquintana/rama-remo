import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AnnualPlanForm,
  type AnnualPlanFormValues,
} from '../components/AnnualPlanForm';
import { StatusMessage } from '../components/StatusMessage';
import { getAnnualPlan, updateAnnualPlan } from '../services/planning';
import type { AnnualPlanPayload } from '../types/planning';

export function AnnualPlanEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const planId = Number(params.id);
  const [initialValues, setInitialValues] = useState<AnnualPlanFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getAnnualPlan(planId)
      .then((plan) => {
        setInitialValues({
          anio: String(plan.anio),
          nombre: plan.nombre,
          estado: plan.estado,
          objetivoGeneral: plan.objetivoGeneral ?? '',
          areas: plan.areas.map((area) => ({
            idAreaPlan: area.idAreaPlan,
            nombre: area.nombre,
            descripcion: area.descripcion ?? '',
          })),
        });
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [planId]);

  const handleSubmit = async (values: AnnualPlanPayload) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await updateAnnualPlan(planId, values);
      navigate(`/planificacion/${planId}`, {
        state: { message: 'Plan anual actualizado correctamente.' },
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
          <h2>Editar plan anual</h2>
          <p>Ajusta objetivos, areas y alcance del plan para el seguimiento.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando plan anual...</p>
        </div>
      ) : !initialValues ? (
        <StatusMessage kind="error" message={errorMessage || 'Plan no encontrado.'} />
      ) : (
        <AnnualPlanForm
          errorMessage={errorMessage}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      )}
    </section>
  );
}
