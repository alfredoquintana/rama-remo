import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  competitionStatusLabels,
  competitionTypeLabels,
} from '../app/labels';
import {
  buildCompetitionPayload,
  CompetitionFormFields,
  createEmptyCompetitionForm,
} from '../components/competitions/CompetitionForms';
import { CompetitionModal } from '../components/competitions/CompetitionModal';
import { StatusMessage } from '../components/StatusMessage';
import {
  createCompetition,
  getCompetitionCatalogs,
  getCompetitions,
} from '../services/competitions';
import type {
  CompetitionCatalogsResponse,
  CompetitionSummary,
} from '../types/competitions';
import { formatDate } from '../utils/dateTime';

type NavigationState = {
  message?: string;
};

function formatCompetitionWindow(fechaInicio: string, fechaFin: string) {
  const start = formatDate(fechaInicio);
  const end = formatDate(fechaFin);
  return start && end ? `${start} - ${end}` : start || end || 'Sin fechas';
}

export function CompetitionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [catalogs, setCatalogs] = useState<CompetitionCatalogsResponse | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionSummary[]>([]);
  const [competitionForm, setCompetitionForm] = useState(
    createEmptyCompetitionForm(null),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isCreateCompetitionOpen, setIsCreateCompetitionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([getCompetitionCatalogs(), getCompetitions()])
      .then(([nextCatalogs, nextCompetitions]) => {
        if (!active) {
          return;
        }

        setCatalogs(nextCatalogs);
        setCompetitionForm(createEmptyCompetitionForm(nextCatalogs));
        setCompetitions(nextCompetitions);
        setErrorMessage('');
      })
      .catch((error: Error) => {
        if (active) {
          setErrorMessage(error.message);
        }
      })
      .finally(() => {
        if (active) {
          setIsCatalogLoading(false);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const navigationState = (location.state as NavigationState | null) ?? null;

  const openCreateCompetitionModal = () => {
    setCompetitionForm(createEmptyCompetitionForm(catalogs));
    setIsCreateCompetitionOpen(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCreateCompetition = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const detail = await createCompetition(buildCompetitionPayload(competitionForm));
      navigate(`/competencias/${detail.idCompetencia}`, {
        state: { message: 'Competencia creada correctamente.' },
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
          <h2>Competencias</h2>
          <p>
            Revisa la grilla de regatas y competencias ingresadas, y entra a una
            pagina aparte cuando necesites gestionarlas.
          </p>
        </div>

        <button
          className="button button-primary"
          disabled={isCatalogLoading}
          type="button"
          onClick={openCreateCompetitionModal}
        >
          Registrar competencia
        </button>
      </div>

      {navigationState?.message ? (
        <StatusMessage kind="success" message={navigationState.message} />
      ) : null}

      {successMessage ? (
        <StatusMessage kind="success" message={successMessage} />
      ) : null}

      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      <div className="panel-card">
        <div className="panel-card__header">
          <div>
            <h3>Regatas ingresadas</h3>
            <p className="form-help">
              Usa esta vista como entrada del modulo y abre la gestion solo en la
              competencia que vas a trabajar.
            </p>
          </div>
          <span className="pill neutral">
            {competitions.length} competencia{competitions.length === 1 ? '' : 's'}
          </span>
        </div>

        {isLoading ? (
          <p>Cargando competencias...</p>
        ) : (
          <table className="data-table competitions-table">
            <thead>
              <tr>
                <th>Competencia</th>
                <th>Periodo</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Programa</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {competitions.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    Aun no hay competencias registradas. Crea la primera para
                    empezar a cargar regatas, pruebas e inscripciones.
                  </td>
                </tr>
              ) : (
                competitions.map((competition) => (
                  <tr key={competition.idCompetencia}>
                    <td data-label="Competencia" className="competitions-table__name">
                      <strong>{competition.nombre}</strong>
                      <div className="table-note">
                        {competition.organizador || competition.sede
                          ? [competition.organizador, competition.sede]
                              .filter(Boolean)
                              .join(' · ')
                          : 'Sin organizador ni sede registrados.'}
                      </div>
                    </td>

                    <td data-label="Periodo">
                      {formatCompetitionWindow(
                        competition.fechaInicio,
                        competition.fechaFin,
                      )}
                    </td>

                    <td data-label="Tipo">
                      {competitionTypeLabels[competition.tipoCompetencia]}
                    </td>

                    <td data-label="Estado">
                      <span className="pill neutral">
                        {competitionStatusLabels[competition.estado]}
                      </span>
                    </td>

                    <td data-label="Programa">
                      <strong>{competition.resumen.pruebas}</strong>
                      <div className="table-note">
                        {competition.resumen.inscripciones} inscripcion
                        {competition.resumen.inscripciones === 1 ? '' : 'es'} cargada
                        {competition.resumen.inscripciones === 1 ? '' : 's'}
                      </div>
                    </td>

                    <td data-label="Acciones">
                      <div className="table-actions competitions-table__actions">
                        <Link
                          className="button button-secondary button-small"
                          to={`/competencias/${competition.idCompetencia}`}
                        >
                          Gestionar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isCreateCompetitionOpen ? (
        <CompetitionModal
          description="Registra los datos base y luego continua la gestion completa en una pagina separada."
          size="wide"
          title="Nueva competencia"
          onClose={() => !isSubmitting && setIsCreateCompetitionOpen(false)}
        >
          <form className="competition-modal__form" onSubmit={handleCreateCompetition}>
            <CompetitionFormFields
              catalogs={catalogs}
              form={competitionForm}
              onChange={setCompetitionForm}
            />

            <div className="form-actions">
              <button
                className="button button-secondary"
                disabled={isSubmitting}
                type="button"
                onClick={() => setIsCreateCompetitionOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="button button-primary"
                disabled={isSubmitting || isCatalogLoading}
                type="submit"
              >
                {isSubmitting ? 'Guardando...' : 'Crear y gestionar'}
              </button>
            </div>
          </form>
        </CompetitionModal>
      ) : null}
    </section>
  );
}
