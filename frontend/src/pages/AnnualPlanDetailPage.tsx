import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { PlanFollowupForm, type PlanFollowupFormValues } from '../components/PlanFollowupForm';
import { PlanItemForm, type PlanItemFormValues } from '../components/PlanItemForm';
import { StatusMessage } from '../components/StatusMessage';
import {
  createPlanningFollowup,
  createPlanningItem,
  getAnnualPlan,
  updatePlanningItem,
} from '../services/planning';
import { getUsers } from '../services/users';
import type {
  AnnualPlanDetail,
  PlanningFollowupPayload,
  PlanningItemPayload,
} from '../types/planning';
import type { User } from '../types/users';

type NavigationState = {
  message?: string;
};

export function AnnualPlanDetailPage() {
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
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [submittingFollowupItemId, setSubmittingFollowupItemId] = useState<number | null>(
    null,
  );
  const [openFollowupItemId, setOpenFollowupItemId] = useState<number | null>(null);
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

  const navigationState = (location.state as NavigationState | null) ?? null;

  const defaultItemValues = useMemo<PlanItemFormValues>(
    () => ({
      idAreaPlan: plan?.areas[0] ? String(plan.areas[0].idAreaPlan) : '',
      idResponsable: '',
      titulo: '',
      descripcion: '',
      resultadoEsperado: '',
      prioridad: 'media',
      estado: 'pendiente',
      fechaPlanificada: '',
      fechaCumplimientoReal: '',
      resumenFinal: '',
    }),
    [plan?.areas],
  );

  const handleCreateItem = async (values: PlanningItemPayload) => {
    if (!plan) {
      return;
    }

    setIsItemSubmitting(true);
    setItemErrorMessage('');
    setItemSuccessMessage('');
    setFollowupSuccessMessage('');

    try {
      const updatedPlan = await createPlanningItem(plan.idPlanAnual, values);
      setPlan(updatedPlan);
      setCreateItemFormVersion((current) => current + 1);
      setItemSuccessMessage('Item guardado correctamente.');
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
      setEditingItemId(null);
      setItemSuccessMessage('Item actualizado correctamente.');
    } catch (error) {
      setItemErrorMessage((error as Error).message);
    } finally {
      setIsItemSubmitting(false);
    }
  };

  const handleCreateFollowup = async (
    itemId: number,
    values: PlanningFollowupPayload,
  ) => {
    setSubmittingFollowupItemId(itemId);
    setFollowupErrorMessage('');
    setFollowupSuccessMessage('');
    setItemSuccessMessage('');

    try {
      const updatedPlan = await createPlanningFollowup(itemId, values);
      setPlan(updatedPlan);
      setFollowupFormVersion((current) => current + 1);
      setFollowupSuccessMessage('Seguimiento guardado correctamente.');
    } catch (error) {
      setFollowupErrorMessage((error as Error).message);
    } finally {
      setSubmittingFollowupItemId(null);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Detalle de planificacion anual</h2>
          <p>
            Seguimiento operativo del anio para rendir cuentas con datos claros,
            responsables y retroalimentacion.
          </p>
        </div>
        {plan ? (
          <Link
            className="button button-primary"
            to={`/planificacion/${plan.idPlanAnual}/editar`}
          >
            Editar plan
          </Link>
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
          <div className="content-grid">
            <article className="panel-card">
              <div className="panel-card__header">
                <h3>
                  {plan.nombre} {plan.anio}
                </h3>
                <span className="pill neutral">{plan.estado}</span>
              </div>
              <p>{plan.objetivoGeneral ?? 'Sin objetivo general definido todavia.'}</p>
              <div className="planning-note-grid">
                <div className="planning-note">
                  <strong>Transparencia</strong>
                  <span>{plan.transparencyNotes.cumplidoVsTotal}</span>
                </div>
                <div className="planning-note">
                  <strong>Alerta</strong>
                  <span>{plan.transparencyNotes.pendientesCriticos}</span>
                </div>
              </div>
            </article>

            <article className="panel-card">
              <h3>Areas del plan</h3>
              <div className="planning-area-grid">
                {plan.areas.map((area) => (
                  <div key={area.idAreaPlan} className="planning-area-card">
                    <strong>{area.nombre}</strong>
                    <span>{area.descripcion ?? 'Sin descripcion adicional.'}</span>
                    <small>{area.itemCount} items asociados</small>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="stats-grid planning-stats-grid">
            <article className="stat-card">
              <span>Total items</span>
              <strong>{plan.summary.totalItems}</strong>
            </article>
            <article className="stat-card">
              <span>Cumplidos</span>
              <strong>{plan.summary.cumplidos}</strong>
            </article>
            <article className="stat-card">
              <span>En curso</span>
              <strong>{plan.summary.enCurso}</strong>
            </article>
            <article className="stat-card">
              <span>Atrasados</span>
              <strong>{plan.summary.atrasados}</strong>
            </article>
          </div>

          <article className="panel-card">
            <div className="panel-card__header">
              <h3>Agregar item al plan</h3>
              <span className="pill success">
                {plan.summary.porcentajeCumplimiento}% cumplimiento
              </span>
            </div>

            {plan.areas.length === 0 ? (
              <StatusMessage
                kind="error"
                message="Este plan no tiene areas disponibles. Agregalas editando el plan."
              />
            ) : (
              <PlanItemForm
                areas={plan.areas}
                errorMessage={itemErrorMessage}
                initialValues={defaultItemValues}
                isSubmitting={isItemSubmitting}
                key={`create-item-${createItemFormVersion}`}
                onSubmit={handleCreateItem}
                submitLabel="Guardar item"
                successMessage={itemSuccessMessage}
                users={users}
              />
            )}
          </article>

          <article className="panel-card">
            <div className="panel-card__header">
              <h3>Items y seguimiento</h3>
              <span className="pill neutral">{plan.items.length} registrados</span>
            </div>

            {followupSuccessMessage ? (
              <StatusMessage kind="success" message={followupSuccessMessage} />
            ) : null}

            {followupErrorMessage ? (
              <StatusMessage kind="error" message={followupErrorMessage} />
            ) : null}

            {plan.items.length === 0 ? (
              <p>Aun no hay compromisos cargados para este plan.</p>
            ) : (
              <div className="planning-item-list">
                {plan.items.map((item) => {
                  const itemFormValues: PlanItemFormValues = {
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

                  const followupInitialValues: PlanFollowupFormValues = {
                    estado: item.estado,
                    avancePorcentaje: String(item.lastProgress),
                    comentario: '',
                    bloqueos: '',
                    proximoPaso: '',
                    funcionoBien: '',
                    porMejorar: '',
                  };

                  const isEditing = editingItemId === item.idPlanItem;
                  const isOpenFollowup = openFollowupItemId === item.idPlanItem;

                  return (
                    <div key={item.idPlanItem} className="planning-item-card">
                      <div className="planning-item-card__header">
                        <div>
                          <h4>{item.titulo}</h4>
                          <div className="planning-item-card__meta">
                            <span>{item.area.nombre}</span>
                            <span>{item.prioridad}</span>
                            <span>{item.estado}</span>
                            <span>
                              Responsable: {item.responsable?.nombre ?? 'Sin asignar'}
                            </span>
                            <span>Planificado: {item.fechaPlanificada}</span>
                          </div>
                        </div>

                        <div className="table-actions">
                          <button
                            className="button button-secondary button-small"
                            onClick={() =>
                              setEditingItemId((current) =>
                                current === item.idPlanItem ? null : item.idPlanItem,
                              )
                            }
                            type="button"
                          >
                            {isEditing ? 'Cerrar edicion' : 'Editar item'}
                          </button>
                          <button
                            className="button button-secondary button-small"
                            onClick={() => {
                              setFollowupErrorMessage('');
                              setFollowupSuccessMessage('');
                              setOpenFollowupItemId((current) =>
                                current === item.idPlanItem ? null : item.idPlanItem,
                              );
                            }}
                            type="button"
                          >
                            {isOpenFollowup ? 'Cerrar seguimiento' : 'Registrar seguimiento'}
                          </button>
                        </div>
                      </div>

                      <div className="planning-item-card__body">
                        <div>
                          <strong>Descripcion</strong>
                          <p>{item.descripcion}</p>
                        </div>
                        <div>
                          <strong>Resultado esperado</strong>
                          <p>{item.resultadoEsperado}</p>
                        </div>
                        {item.resumenFinal ? (
                          <div>
                            <strong>Resumen final</strong>
                            <p>{item.resumenFinal}</p>
                          </div>
                        ) : null}
                      </div>

                      <div className="planning-progress">
                        <div className="planning-progress__label">
                          <span>Avance reportado</span>
                          <strong>{item.lastProgress}%</strong>
                        </div>
                        <div className="planning-progress__bar">
                          <span style={{ width: `${item.lastProgress}%` }} />
                        </div>
                      </div>

                      {isEditing ? (
                        <PlanItemForm
                          areas={plan.areas}
                          errorMessage={itemErrorMessage}
                          initialValues={itemFormValues}
                          isSubmitting={isItemSubmitting}
                          key={`edit-${item.idPlanItem}`}
                          onCancel={() => setEditingItemId(null)}
                          onSubmit={(values) => handleUpdateItem(item.idPlanItem, values)}
                          submitLabel="Actualizar item"
                          successMessage={
                            editingItemId === item.idPlanItem ? itemSuccessMessage : ''
                          }
                          users={users}
                        />
                      ) : null}

                      {isOpenFollowup ? (
                        <PlanFollowupForm
                          errorMessage=""
                          initialValues={followupInitialValues}
                          isSubmitting={submittingFollowupItemId === item.idPlanItem}
                          key={`followup-${item.idPlanItem}-${followupFormVersion}`}
                          onCancel={() => setOpenFollowupItemId(null)}
                          onSubmit={(values) => handleCreateFollowup(item.idPlanItem, values)}
                          submitLabel="Guardar seguimiento"
                          successMessage=""
                        />
                      ) : null}

                      <div className="planning-followup-list">
                        {item.followups.length === 0 ? (
                          <p className="form-help">Aun no hay seguimientos registrados.</p>
                        ) : (
                          item.followups.map((followup) => (
                            <div
                              key={followup.idPlanSeguimiento}
                              className="planning-followup-card"
                            >
                              <div className="planning-followup-card__header">
                                <strong>
                                  {new Date(followup.fechaSeguimiento).toLocaleString()}
                                </strong>
                                <span>
                                  {followup.estado} - {followup.avancePorcentaje}%
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
                                    <strong>Proximo paso</strong>
                                    <span>{followup.proximoPaso}</span>
                                  </div>
                                ) : null}
                                {followup.funcionoBien ? (
                                  <div>
                                    <strong>Funciono bien</strong>
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
                                Registrado por {followup.registradoPor?.nombre ?? 'usuario no disponible'}
                              </small>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </>
      ) : null}
    </section>
  );
}
