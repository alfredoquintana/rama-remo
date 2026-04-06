import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { getAnnualPlans } from '../services/planning';
import type { AnnualPlanListItem } from '../types/planning';

type NavigationState = {
  message?: string;
};

export function AnnualPlansListPage() {
  const location = useLocation();
  const [plans, setPlans] = useState<AnnualPlanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Planificacion anual</h2>
          <p>
            Define compromisos del anio, responsables y seguimiento para transparentar
            avances ante la rama.
          </p>
        </div>
        <Link className="button button-primary" to="/planificacion/nuevo">
          Crear plan anual
        </Link>
      </div>

      {navigationState?.message ? (
        <StatusMessage kind="success" message={navigationState.message} />
      ) : null}

      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      <div className="panel-card">
        {isLoading ? (
          <p>Cargando planificacion anual...</p>
        ) : plans.length === 0 ? (
          <p>Aun no hay planes anuales creados.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Anio</th>
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
                  <td>{plan.anio}</td>
                  <td>
                    <strong>{plan.nombre}</strong>
                    <div className="table-note">
                      {plan.objetivoGeneral ?? 'Sin objetivo general cargado.'}
                    </div>
                  </td>
                  <td>{plan.estado}</td>
                  <td>{plan.summary.totalItems}</td>
                  <td>{plan.summary.porcentajeCumplimiento}%</td>
                  <td>{plan.summary.atrasados}</td>
                  <td>
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
