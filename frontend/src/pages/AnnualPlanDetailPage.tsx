import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  planningItemPriorityLabels,
  planningItemStatusLabels,
} from '../app/labels';
import {
  PlanFollowupForm,
  type PlanFollowupFormValues,
} from '../components/PlanFollowupForm';
import { PlanItemForm, type PlanItemFormValues } from '../components/PlanItemForm';
import { StatusMessage } from '../components/StatusMessage';
import {
  createPlanningFollowup,
  createPlanningItem,
  deleteAnnualPlan,
  getAnnualPlan,
  updatePlanningItem,
} from '../services/planning';
import { getUsers } from '../services/users';
import type {
  AnnualPlanDetail,
  PlanningFollowupPayload,
  PlanningItem,
  PlanningItemPayload,
} from '../types/planning';
import type { User } from '../types/users';
import { formatDate, formatDateTime } from '../utils/dateTime';

type NavigationState = {
  message?: string;
};

type ItemModalMode = 'detail' | 'edit' | 'followup';

const FINAL_ITEM_STATES = new Set<string>([
  'cumplido',
  'parcialmente_cumplido',
  'no_cumplido',
  'cancelado',
]);

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`planning-chevron ${isOpen ? 'is-open' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function truncateText(value: string, maxLength = 180) {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength).trimEnd()}...`;
}

function buildItemFormValues(item: PlanningItem): PlanItemFormValues {
  return {
    idAreaPlan: String(item.area.idAreaPlan),
    idResponsable: item.responsable ? String(item.responsable.idUsuario) : '',
    titulo: item.titulo,
    descripcion: item.descripcion,
    resultadoEsperado: item.resultadoEsperado,
    prioridad: item.prioridad,
    estado: item.estado,
    fechaPlanificada: item.fechaPlanificada,
    fechaCumplimientoReal: item.fechaCumplimientoReal ?? '',
    resumenFinal: item.resumenFinal ?? '',
  };
}

function buildFollowupInitialValues(item: PlanningItem): PlanFollowupFormValues {
  return {
    estado: item.estado,
    avancePorcentaje: String(item.lastProgress),
    comentario: '',
    bloqueos: '',
    proximoPaso: '',
    funcionoBien: '',
    porMejorar: '',
  };
}

export function AnnualPlanDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const planId = Number(params.id);
  const [plan, setPlan] = useState<AnnualPlanDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [itemErrorMessage, setItemErrorMessage] = useState('');
  const [itemSuccessMessage, setItemSuccessMessage] = useState('');
  const [followupErrorMessage, setFollowupErrorMessage] = useState('');
  const [followupSuccessMessage, setFollowupSuccessMessage] = useState('');
  const [isItemSubmitting, setIsItemSubmitting] = useState(false);
  const [openAreaId, setOpenAreaId] = useState<number | null>(null);
  const [createItemAreaId, setCreateItemAreaId] = useState<number | null>(null);
  const [submittingFollowupItemId, setSubmittingFollowupItemId] = useState<number | null>(
    null,
  );
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [itemModalMode, setItemModalMode] = useState<ItemModalMode>('detail');
  const [createItemFormVersion, setCreateItemFormVersion] = useState(0);
  const [followupFormVersion, setFollowupFormVersion] = useState(0);

  useEffect(() => {
    Promise.all([getAnnualPlan(planId), getUsers()])
      .then(([planData, usersData]) => {
        setPlan(planData);
        setUsers(usersData);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [planId]);

  useEffect(() => {
    if (!plan?.areas.length) {
      setOpenAreaId(null);
      return;
    }

    if (openAreaId != null && !plan.areas.some((area) => area.idAreaPlan === openAreaId)) {
      setOpenAreaId(null);
    }
  }, [openAreaId, plan]);

  useEffect(() => {
    if (!plan?.items.length) {
      setSelectedItemId(null);
      return;
    }

    const itemIds = new Set(plan.items.map((item) => item.idPlanItem));

    if (selectedItemId != null && !itemIds.has(selectedItemId)) {
      setSelectedItemId(null);
    }
  }, [plan, selectedItemId]);

  const navigationState = (location.state as NavigationState | null) ?? null;

  const selectedItem = useMemo(
    () => plan?.items.find((item) => item.idPlanItem === selectedItemId) ?? null,
    [plan?.items, selectedItemId],
  );

  const areaSections = useMemo(() => {
    if (!plan) {
      return [];
    }

    const today = new Date().toISOString().slice(0, 10);

    return plan.areas.map((area) => {
      const items = plan.items.filter((item) => item.area.idAreaPlan === area.idAreaPlan);
      const stats = items.reduce(
        (accumulator, item) => {
          accumulator.total += 1;
          if (item.estado === 'cumplido') accumulator.cumplidos += 1;
          if (item.estado === 'en_curso') accumulator.enCurso += 1;
          if (!FINAL_ITEM_STATES.has(item.estado) && item.fechaPlanificada < today) {
            accumulator.atrasados += 1;
          }
          return accumulator;
        },
        { total: 0, cumplidos: 0, enCurso: 0, atrasados: 0 },
      );

      return { area, items, stats };
    });
  }, [plan]);

  const createItemInitialValues = useMemo<PlanItemFormValues>(() => {
    const targetAreaId = createItemAreaId ?? openAreaId ?? plan?.areas[0]?.idAreaPlan ?? null;

    return {
      idAreaPlan: targetAreaId ? String(targetAreaId) : '',
      idResponsable: '',
      titulo: '',
      descripcion: '',
      resultadoEsperado: '',
      prioridad: 'media',
      estado: 'pendiente',
      fechaPlanificada: '',
      fechaCumplimientoReal: '',
      resumenFinal: '',
    };
  }, [createItemAreaId, openAreaId, plan?.areas]);

  const openCreateItemForm = (areaId: number) => {
    setOpenAreaId(areaId);
    setCreateItemAreaId(areaId);
    setSelectedItemId(null);
    setItemErrorMessage('');
    setItemSuccessMessage('');
  };

  const toggleArea = (areaId: number) => {
    setOpenAreaId((current) => (current === areaId ? null : areaId));
  };

  const openItemModal = (itemId: number, mode: ItemModalMode = 'detail') => {
    setSelectedItemId(itemId);
    setItemModalMode(mode);
    setItemErrorMessage('');
    setFollowupErrorMessage('');
  };

  const closeItemModal = () => {
    setSelectedItemId(null);
    setItemModalMode('detail');
    setItemErrorMessage('');
    setFollowupErrorMessage('');
  };

  const handleCreateItem = async (values: PlanningItemPayload) => {
    if (!plan) return;

    setIsItemSubmitting(true);
    setItemErrorMessage('');
    setItemSuccessMessage('');
    setFollowupSuccessMessage('');

    try {
      const updatedPlan = await createPlanningItem(plan.idPlanAnual, values);
      setPlan(updatedPlan);
      setOpenAreaId(values.idAreaPlan);
      setCreateItemAreaId(null);
      setCreateItemFormVersion((current) => current + 1);
      setItemSuccessMessage('Ítem guardado correctamente.');
    } catch (error) {
      setItemErrorMessage((error as Error).message);
    } finally {
      setIsItemSubmitting(false);
    }
  };

  const handleUpdateItem = async (itemId: number, values: PlanningItemPayload) => {
    setIsItemSubmitting(true);
    setItemErrorMessage('');
    setItemSuccessMessage('');
    setFollowupSuccessMessage('');

    try {
      const updatedPlan = await updatePlanningItem(itemId, values);
      setPlan(updatedPlan);
      setOpenAreaId(values.idAreaPlan);
      setItemSuccessMessage('Ítem actualizado correctamente.');
      setItemModalMode('detail');
    } catch (error) {
      setItemErrorMessage((error as Error).message);
    } finally {
      setIsItemSubmitting(false);
    }
  };

  const handleCreateFollowup = async (itemId: number, values: PlanningFollowupPayload) => {
    setSubmittingFollowupItemId(itemId);
    setFollowupErrorMessage('');
    setFollowupSuccessMessage('');
    setItemSuccessMessage('');

    try {
      const updatedPlan = await createPlanningFollowup(itemId, values);
      setPlan(updatedPlan);
      setFollowupFormVersion((current) => current + 1);
      setFollowupSuccessMessage('Seguimiento guardado correctamente.');
      setItemModalMode('detail');
    } catch (error) {
      setFollowupErrorMessage((error as Error).message);
    } finally {
      setSubmittingFollowupItemId(null);
    }
  };

  const handleDeletePlan = async () => {
    if (!plan) return;

    const confirmed = window.confirm(
      `Seguro que quieres eliminar el plan "${plan.nombre}" del año ${plan.anio}? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) return;

    try {
      const response = await deleteAnnualPlan(plan.idPlanAnual);
      navigate('/planificacion', { state: { message: response.message } });
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Plan anual</h2>
          <p>
            Parte desde el resumen del plan y entra al detalle solo cuando haga
            falta.
          </p>
        </div>
        {plan ? (
          <div className="table-actions">
            <Link
              className="button button-primary"
              to={`/planificacion/${plan.idPlanAnual}/editar`}
            >
              Editar plan
            </Link>
            <button
              className="button button-danger"
              onClick={() => void handleDeletePlan()}
              type="button"
            >
              Eliminar plan
            </button>
          </div>
        ) : null}
      </div>

      {navigationState?.message ? (
        <StatusMessage kind="success" message={navigationState.message} />
      ) : null}

      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando plan anual...</p>
        </div>
      ) : plan ? (
        <>
          <article className="panel-card">
            <div className="panel-card__header">
              <div>
                <h3>Áreas y compromisos</h3>
                <p className="form-help">
                  Abre un área para ver sus ítems y profundiza solo en el que
                  necesites revisar.
                </p>
              </div>
              <span className="pill neutral">{plan.areas.length} áreas</span>
            </div>

            {followupSuccessMessage ? (
              <StatusMessage kind="success" message={followupSuccessMessage} />
            ) : null}

            {followupErrorMessage ? (
              <StatusMessage kind="error" message={followupErrorMessage} />
            ) : null}

            {itemSuccessMessage && createItemAreaId == null ? (
              <StatusMessage kind="success" message={itemSuccessMessage} />
            ) : null}

            {plan.areas.length === 0 ? (
              <StatusMessage
                kind="error"
                message="Este plan no tiene áreas disponibles. Agrégalas editando el plan."
              />
            ) : (
              <div className="planning-area-stack">
                {areaSections.map(({ area, items, stats }) => {
                  const isAreaOpen = openAreaId === area.idAreaPlan;
                  const isCreateOpenForArea = createItemAreaId === area.idAreaPlan;

                  return (
                    <section
                      key={area.idAreaPlan}
                      className={`planning-area-section ${isAreaOpen ? 'is-open' : ''}`}
                    >
                      <button
                        aria-expanded={isAreaOpen}
                        className="planning-area-toggle"
                        type="button"
                        onClick={() => toggleArea(area.idAreaPlan)}
                      >
                        <div className="planning-area-toggle__main">
                          <div className="planning-area-toggle__title-row">
                            <strong>{area.nombre}</strong>
                          </div>
                          <p>{area.descripcion ?? 'Sin descripción adicional.'}</p>
                        </div>

                        <div className="planning-area-toggle__meta">
                          <span>{stats.cumplidos} cumplidos</span>
                          <span>{stats.enCurso} en curso</span>
                          <span>{stats.atrasados} atrasados</span>
                          <ChevronIcon isOpen={isAreaOpen} />
                        </div>
                      </button>

                      {isAreaOpen ? (
                        <div className="planning-area-panel">
                          <div className="planning-area-toolbar">
                            <button
                              className="button button-secondary button-small"
                              type="button"
                              onClick={() => openCreateItemForm(area.idAreaPlan)}
                            >
                              Nuevo ítem en esta área
                            </button>
                          </div>

                          {isCreateOpenForArea ? (
                            <div className="planning-item-detail">
                              <PlanItemForm
                                areas={plan.areas}
                                errorMessage={itemErrorMessage}
                                initialValues={createItemInitialValues}
                                isSubmitting={isItemSubmitting}
                                key={`create-item-${createItemFormVersion}-${area.idAreaPlan}`}
                                onCancel={() => {
                                  setCreateItemAreaId(null);
                                  setItemErrorMessage('');
                                }}
                                onSubmit={handleCreateItem}
                                submitLabel="Guardar ítem"
                                successMessage={itemSuccessMessage}
                                users={users}
                              />
                            </div>
                          ) : null}

                          {items.length === 0 ? (
                            <div className="planning-area-empty">
                              <p>No hay compromisos registrados en esta área.</p>
                            </div>
                          ) : (
                            <div className="planning-item-list">
                              {items.map((item) => {
                                const latestFollowup = item.followups[0] ?? null;

                                return (
                                  <article key={item.idPlanItem} className="planning-item-card">
                                    <div className="planning-item-summary">
                                      <div className="planning-item-summary__header">
                                        <div className="planning-item-summary__copy">
                                          <h4>{item.titulo}</h4>
                                          <div className="planning-item-card__meta">
                                            <span>
                                              {planningItemPriorityLabels[item.prioridad]}
                                            </span>
                                            <span>
                                              {planningItemStatusLabels[item.estado]}
                                            </span>
                                            <span>
                                              Responsable:{' '}
                                              {item.responsable?.nombre ?? 'Sin asignar'}
                                            </span>
                                            <span>
                                              Planificado: {formatDate(item.fechaPlanificada)}
                                            </span>
                                          </div>

                                          <p>{truncateText(item.descripcion)}</p>
                                        </div>

                                        <div className="planning-item-summary__actions">
                                          <button
                                            className="button button-secondary button-small planning-item-summary__manage-button"
                                            type="button"
                                            onClick={() => openItemModal(item.idPlanItem)}
                                          >
                                            Gestionar ítem
                                          </button>
                                        </div>
                                      </div>

                                      <div className="planning-item-summary__footer">
                                        <div className="planning-item-summary__metrics">
                                          <div className="planning-item-summary__metric-card planning-item-summary__metric-card--progress">
                                            <div className="planning-progress__label">
                                              <span>Avance</span>
                                              <strong>{item.lastProgress}%</strong>
                                            </div>
                                            <div className="planning-progress__bar">
                                              <span
                                                style={{ width: `${item.lastProgress}%` }}
                                              />
                                            </div>
                                          </div>

                                          <div className="planning-item-summary__metric-card planning-item-summary__signals">
                                            <span>
                                              {item.followups.length} seguimientos
                                            </span>
                                            <span>
                                              {latestFollowup
                                                ? `Último: ${formatDateTime(
                                                    latestFollowup.fechaSeguimiento,
                                                  )}`
                                                : 'Sin seguimientos'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            )}
          </article>

          {selectedItem ? (
            <div
              className="planning-item-modal-backdrop"
              role="presentation"
              onClick={closeItemModal}
            >
              <div
                aria-modal="true"
                className="planning-item-modal"
                role="dialog"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="planning-item-modal__header">
                  <div>
                    <div className="planning-overview__eyebrow">
                      {selectedItem.area.nombre}
                    </div>
                    <h3>{selectedItem.titulo}</h3>
                    <div className="planning-item-card__meta">
                      <span>
                        {planningItemPriorityLabels[selectedItem.prioridad]}
                      </span>
                      <span>{planningItemStatusLabels[selectedItem.estado]}</span>
                      <span>
                        Responsable:{' '}
                        {selectedItem.responsable?.nombre ?? 'Sin asignar'}
                      </span>
                      <span>
                        Planificado: {formatDate(selectedItem.fechaPlanificada)}
                      </span>
                    </div>
                  </div>

                  <button
                    aria-label="Cerrar gestión del ítem"
                    className="app-header__account-close"
                    type="button"
                    onClick={closeItemModal}
                  >
                    x
                  </button>
                </div>

                <div className="planning-item-modal__tabs">
                  <button
                    className={`button ${itemModalMode === 'detail' ? 'button-primary' : 'button-secondary'}`}
                    type="button"
                    onClick={() => setItemModalMode('detail')}
                  >
                    Resumen
                  </button>
                  <button
                    className={`button ${itemModalMode === 'edit' ? 'button-primary' : 'button-secondary'}`}
                    type="button"
                    onClick={() => setItemModalMode('edit')}
                  >
                    Editar
                  </button>
                  <button
                    className={`button ${itemModalMode === 'followup' ? 'button-primary' : 'button-secondary'}`}
                    type="button"
                    onClick={() => setItemModalMode('followup')}
                  >
                    Seguimiento
                  </button>
                </div>

                {itemModalMode === 'detail' ? (
                  <div className="planning-item-detail">
                    {itemSuccessMessage ? (
                      <StatusMessage kind="success" message={itemSuccessMessage} />
                    ) : null}
                    {followupSuccessMessage ? (
                      <StatusMessage kind="success" message={followupSuccessMessage} />
                    ) : null}

                    <div className="planning-item-card__body">
                      <div>
                        <strong>Descripción</strong>
                        <p>{selectedItem.descripcion}</p>
                      </div>
                      <div>
                        <strong>Resultado esperado</strong>
                        <p>{selectedItem.resultadoEsperado}</p>
                      </div>
                      {selectedItem.resumenFinal ? (
                        <div>
                          <strong>Resumen final</strong>
                          <p>{selectedItem.resumenFinal}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="planning-item-summary__metrics">
                      <div className="planning-progress">
                        <div className="planning-progress__label">
                          <span>Avance</span>
                          <strong>{selectedItem.lastProgress}%</strong>
                        </div>
                        <div className="planning-progress__bar">
                          <span style={{ width: `${selectedItem.lastProgress}%` }} />
                        </div>
                      </div>

                      <div className="planning-item-summary__signals">
                        <span>{selectedItem.followups.length} seguimientos</span>
                        <span>
                          {selectedItem.fechaCumplimientoReal
                            ? `Cierre: ${formatDate(selectedItem.fechaCumplimientoReal)}`
                            : 'Sin fecha de cierre'}
                        </span>
                      </div>
                    </div>

                    <div className="planning-followup-list">
                      <div className="planning-followup-list__header">
                        <strong>Historial de seguimiento</strong>
                        <span>
                          {selectedItem.followups.length === 0
                            ? 'Sin registros'
                            : `${selectedItem.followups.length} registros`}
                        </span>
                      </div>

                      {selectedItem.followups.length === 0 ? (
                        <p className="form-help">Aún no hay seguimientos registrados.</p>
                      ) : (
                        selectedItem.followups.map((followup) => (
                          <div
                            key={followup.idPlanSeguimiento}
                            className="planning-followup-card"
                          >
                            <div className="planning-followup-card__header">
                              <strong>{formatDateTime(followup.fechaSeguimiento)}</strong>
                              <span>
                                {planningItemStatusLabels[followup.estado]} -{' '}
                                {followup.avancePorcentaje}%
                              </span>
                            </div>
                            <p>{followup.comentario}</p>
                            <div className="planning-feedback-grid">
                              {followup.bloqueos ? (
                                <div>
                                  <strong>Bloqueos</strong>
                                  <span>{followup.bloqueos}</span>
                                </div>
                              ) : null}
                              {followup.proximoPaso ? (
                                <div>
                                  <strong>Próximo paso</strong>
                                  <span>{followup.proximoPaso}</span>
                                </div>
                              ) : null}
                              {followup.funcionoBien ? (
                                <div>
                                  <strong>Funcionó bien</strong>
                                  <span>{followup.funcionoBien}</span>
                                </div>
                              ) : null}
                              {followup.porMejorar ? (
                                <div>
                                  <strong>Por mejorar</strong>
                                  <span>{followup.porMejorar}</span>
                                </div>
                              ) : null}
                            </div>
                            <small>
                              Registrado por{' '}
                              {followup.registradoPor?.nombre ?? 'usuario no disponible'}
                            </small>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}

                {itemModalMode === 'edit' ? (
                  <PlanItemForm
                    areas={plan.areas}
                    errorMessage={itemErrorMessage}
                    initialValues={buildItemFormValues(selectedItem)}
                    isSubmitting={isItemSubmitting}
                    key={`edit-${selectedItem.idPlanItem}`}
                    onCancel={closeItemModal}
                    onSubmit={(values) => handleUpdateItem(selectedItem.idPlanItem, values)}
                    submitLabel="Actualizar ítem"
                    successMessage=""
                    users={users}
                  />
                ) : null}

                {itemModalMode === 'followup' ? (
                  <PlanFollowupForm
                    errorMessage={followupErrorMessage}
                    initialValues={buildFollowupInitialValues(selectedItem)}
                    isSubmitting={submittingFollowupItemId === selectedItem.idPlanItem}
                    key={`followup-${selectedItem.idPlanItem}-${followupFormVersion}`}
                    onCancel={closeItemModal}
                    onSubmit={(values) =>
                      handleCreateFollowup(selectedItem.idPlanItem, values)
                    }
                    submitLabel="Guardar seguimiento"
                    successMessage=""
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
