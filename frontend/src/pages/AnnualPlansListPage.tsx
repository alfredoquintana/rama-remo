import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { annualPlanStatusLabels } from '../app/labels';
import { StatusMessage } from '../components/StatusMessage';
import { deleteAnnualPlan, getAnnualPlans } from '../services/planning';
import type { AnnualPlanListItem } from '../types/planning';

type NavigationState = {
  message?: string;
};

export function AnnualPlansListPage() {
  const location = useLocation();
  const [plans, setPlans] = useState<AnnualPlanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    getAnnualPlans()
      .then((data) => {
        setPlans(data);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const navigationState = (location.state as NavigationState | null) ?? null;

  const handleDelete = async (plan: AnnualPlanListItem) => {
    const confirmed = window.confirm(
      `Seguro que quieres eliminar el plan "${plan.nombre}" del año ${plan.anio}? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteAnnualPlan(plan.idPlanAnual);
      setPlans((current) =>
        current.filter((currentPlan) => currentPlan.idPlanAnual !== plan.idPlanAnual),
      );
      setSuccessMessage(response.message);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage((error as Error).message);
      setSuccessMessage('');
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Planificación anual</h2>
          <p>
            Ordena compromisos, responsables y seguimiento para mostrar avances del año.
          </p>
        </div>
        <Link className="button button-primary" to="/planificacion/nuevo">
          Crear plan anual
        </Link>
      </div>

      {navigationState?.message ? (
        <StatusMessage kind="success" message={navigationState.message} />
      ) : null}

      {successMessage ? (
        <StatusMessage kind="success" message={successMessage} />
      ) : null}

      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      <div className="panel-card">
        {isLoading ? (
          <p>Cargando planificación anual...</p>
        ) : plans.length === 0 ? (
          <p>Aún no hay planes anuales creados.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Año</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Items</th>
                <th>Cumplimiento</th>
                <th>Atrasados</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.idPlanAnual}>
                  <td data-label="Año">{plan.anio}</td>
                  <td data-label="Plan">
                    <strong>{plan.nombre}</strong>
                    <div className="table-note">
                      {plan.objetivoGeneral ?? 'Sin objetivo general cargado.'}
                    </div>
                  </td>
                  <td data-label="Estado">{annualPlanStatusLabels[plan.estado]}</td>
                  <td data-label="Items">{plan.summary.totalItems}</td>
                  <td data-label="Cumplimiento">{plan.summary.porcentajeCumplimiento}%</td>
                  <td data-label="Atrasados">{plan.summary.atrasados}</td>
                  <td data-label="Acciones">
                    <div className="table-actions">
                      <Link
                        className="button button-secondary button-small"
                        to={`/planificacion/${plan.idPlanAnual}`}
                      >
                        Ver
                      </Link>
                      <Link
                        className="button button-secondary button-small"
                        to={`/planificacion/${plan.idPlanAnual}/editar`}
                      >
                        Editar
                      </Link>
                      <button
                        className="button button-danger button-small"
                        onClick={() => void handleDelete(plan)}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
