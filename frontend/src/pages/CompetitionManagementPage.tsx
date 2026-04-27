import { useEffect, useMemo, useState, type FormEvent, type SetStateAction } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  competitionRegistrationStatusLabels,
  competitionStatusLabels,
} from '../app/labels';
import {
  CompetitionFormFields,
  CompetitionTestFormFields,
} from '../components/competitions/CompetitionForms';
import {
  buildCompetitionPayload,
  buildTestPayload,
  createCompetitionFormFromDetail,
  createEmptyTestForm,
  createEmptyTestFormForCompetition,
  createTestFormFromTest,
  type CompetitionFormState,
  type CompetitionTestFormState,
} from '../components/competitions/competitionFormState';
import { CompetitionModal } from '../components/competitions/CompetitionModal';
import { StatusMessage } from '../components/StatusMessage';
import { useDebouncedValue } from '../hooks';
import {
  createCompetitionTest,
  getCompetition,
  getCompetitionCatalogs,
  updateCompetition,
  updateCompetitionRegistration,
  updateCompetitionTest,
} from '../services/competitions';
import type {
  CompetitionAthlete,
  CompetitionCatalogsResponse,
  CompetitionDetail,
  CompetitionRegistrationStatus,
  CompetitionTest,
} from '../types/competitions';
import { formatDate, formatDateTime, formatTime } from '../utils/dateTime';
import {
  TESTS_PAGE_SIZE,
  buildPagination,
  buildRegistrationPayload,
  buildTestSearchText,
  createRegistrationDraftFromTest,
  formatCompetitionWindow,
  formatRegistrationLabel,
  matchesCompetitionCategory,
  normalizeSearchValue,
  type NavigationState,
  type RegistrationDraft,
  type RegistrationMemberDraft,
  type TestModalMode,
} from '../features/competitions/competitionManagement.helpers';

export function CompetitionManagementPage() {
  const params = useParams();
  const location = useLocation();
  const competitionId = Number(params.id);
  const navigationState = (location.state as NavigationState | null) ?? null;

  const [catalogs, setCatalogs] = useState<CompetitionCatalogsResponse | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionDetail | null>(null);
  const [editCompetitionForm, setEditCompetitionForm] = useState<CompetitionFormState | null>(null);
  const [testForm, setTestForm] = useState<CompetitionTestFormState>(createEmptyTestForm());
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const [registrationTestId, setRegistrationTestId] = useState<number | null>(null);
  const [registrationDraft, setRegistrationDraft] = useState<RegistrationDraft | null>(null);
  const [athleteSearch, setAthleteSearch] = useState('');
  const [testSearchInput, setTestSearchInput] = useState('');
  const [activeTestSearch, setActiveTestSearch] = useState('');
  const [testsPage, setTestsPage] = useState(1);
  const [detailTestId, setDetailTestId] = useState<number | null>(null);
  const [isEditCompetitionOpen, setIsEditCompetitionOpen] = useState(false);
  const [testModalMode, setTestModalMode] = useState<TestModalMode>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const debouncedTestSearchInput = useDebouncedValue(testSearchInput, 300);

  useEffect(() => {
    let active = true;

    getCompetitionCatalogs()
      .then((data) => {
        if (active) {
          setCatalogs(data);
        }
      })
      .catch((error: Error) => {
        if (active) {
          setErrorMessage(error.message);
        }
      })
      .finally(() => {
        if (active) {
          setIsCatalogLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (Number.isNaN(competitionId)) {
      setSelectedCompetition(null);
      setErrorMessage('La competencia solicitada no es valida.');
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setErrorMessage('');

    getCompetition(competitionId)
      .then((detail) => {
        if (active) {
          setSelectedCompetition(detail);
          setEditCompetitionForm(createCompetitionFormFromDetail(detail));
        }
      })
      .catch((error: Error) => {
        if (active) {
          setSelectedCompetition(null);
          setErrorMessage(error.message);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [competitionId]);

  useEffect(() => {
    setIsEditCompetitionOpen(false);
    setTestModalMode(null);
    setEditingTestId(null);
    setRegistrationTestId(null);
    setRegistrationDraft(null);
    setAthleteSearch('');
    setTestSearchInput('');
    setActiveTestSearch('');
    setTestsPage(1);
    setDetailTestId(null);
  }, [competitionId]);

  useEffect(() => {
    const nextSearch = debouncedTestSearchInput.trim();

    if (nextSearch === activeTestSearch) {
      return;
    }

    setTestsPage(1);
    setActiveTestSearch(nextSearch);
  }, [activeTestSearch, debouncedTestSearchInput]);

  const selectedRegistrationTest = useMemo(
    () =>
      selectedCompetition?.pruebas.find((test) => test.idCompetenciaPrueba === registrationTestId) ?? null,
    [registrationTestId, selectedCompetition],
  );
  const selectedDetailTest = useMemo(
    () =>
      selectedCompetition?.pruebas.find((test) => test.idCompetenciaPrueba === detailTestId) ?? null,
    [detailTestId, selectedCompetition],
  );
  const selectedRegistrationCategoryLabel =
    selectedRegistrationTest?.categoria?.nombre ?? selectedRegistrationTest?.categoriaOrigen ?? null;

  const registrationBoats = useMemo(() => {
    if (!selectedRegistrationTest) {
      return [];
    }

    const requiredBoatTypeId = selectedRegistrationTest.tipoBoteNormalizado?.idTipoBote;
    const boats = catalogs?.botes ?? [];

    if (!selectedRegistrationTest.requiereBote || !requiredBoatTypeId) {
      return boats;
    }

    return boats.filter((boat) => boat.tipoBote?.idTipoBote === requiredBoatTypeId);
  }, [catalogs?.botes, selectedRegistrationTest]);

  const availableAthletes = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(athleteSearch);
    const selectedIds = new Set(registrationDraft?.integrantes.map((member) => member.idDeportista));
    const requiredCategoryId = selectedRegistrationTest?.categoria?.idCategoria ?? null;
    const requiredCategoryName = selectedRegistrationTest?.categoria?.nombre ?? selectedRegistrationTest?.categoriaOrigen ?? null;

    return (catalogs?.deportistas ?? []).filter((athlete) => {
      if (selectedIds.has(String(athlete.idDeportista))) return false;
      if (
        !matchesCompetitionCategory(
          athlete.categoriaVigente?.idCategoria,
          athlete.categoriaVigente?.nombre,
          requiredCategoryId,
          requiredCategoryName,
        )
      ) {
        return false;
      }
      if (!normalizedSearch) return false;

      const athleteSearchText = normalizeSearchValue(
        [athlete.nombre, athlete.rut, athlete.categoriaVigente?.nombre].filter(Boolean).join(' '),
      );

      return athleteSearchText.includes(normalizedSearch);
    });
  }, [
    athleteSearch,
    catalogs?.deportistas,
    registrationDraft?.integrantes,
    selectedRegistrationTest?.categoria?.idCategoria,
    selectedRegistrationTest?.categoria?.nombre,
    selectedRegistrationTest?.categoriaOrigen,
  ]);

  const competitionStats = useMemo(() => {
    if (!selectedCompetition) return { pruebas: 0, nominativas: 0, presuntivas: 0, master: 0 };

    return {
      pruebas: selectedCompetition.pruebas.length,
      nominativas: selectedCompetition.pruebas.filter((test) => test.inscripcion?.estado === 'nominativa').length,
      presuntivas: selectedCompetition.pruebas.filter((test) => !test.inscripcion || test.inscripcion.estado === 'presuntiva').length,
      master: selectedCompetition.pruebas.filter((test) => test.esMaster).length,
    };
  }, [selectedCompetition]);

  const isUpdateBusy = busyKey === 'update-competition';
  const isTestBusy = busyKey === 'save-test';
  const isRegistrationBusy = busyKey === 'save-registration';
  const filteredTests = useMemo(() => {
    const tests = selectedCompetition?.pruebas ?? [];
    const normalizedSearch = normalizeSearchValue(activeTestSearch);

    if (!normalizedSearch) {
      return tests;
    }

    const tokens = normalizedSearch.split(/\s+/).filter(Boolean);

    return tests.filter((test) => {
      const haystack = buildTestSearchText(test);
      return tokens.every((token) => haystack.includes(token));
    });
  }, [activeTestSearch, selectedCompetition?.pruebas]);
  const testsPagination = useMemo(() => {
    const total = filteredTests.length;
    const totalPages = Math.max(Math.ceil(total / TESTS_PAGE_SIZE), 1);
    const currentPage = Math.min(testsPage, totalPages);
    const startIndex = (currentPage - 1) * TESTS_PAGE_SIZE;

    return {
      currentPage,
      total,
      totalPages,
      items: filteredTests.slice(startIndex, startIndex + TESTS_PAGE_SIZE),
    };
  }, [filteredTests, testsPage]);
  const testPages = useMemo(
    () => buildPagination(testsPagination.currentPage, testsPagination.totalPages),
    [testsPagination.currentPage, testsPagination.totalPages],
  );

  const syncCompetition = (detail: CompetitionDetail, message: string) => {
    setSelectedCompetition(detail);
    setEditCompetitionForm(createCompetitionFormFromDetail(detail));
    setSuccessMessage(message);
    setErrorMessage('');
  };

  const closeRegistrationModal = () => {
    if (isRegistrationBusy) {
      return;
    }

    setRegistrationTestId(null);
    setRegistrationDraft(null);
    setAthleteSearch('');
  };

  const openEditCompetitionModal = () => {
    if (!selectedCompetition) {
      return;
    }

    setEditCompetitionForm(createCompetitionFormFromDetail(selectedCompetition));
    setIsEditCompetitionOpen(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const openCreateTestModal = () => {
    setEditingTestId(null);
    setTestForm(createEmptyTestFormForCompetition(selectedCompetition));
    setTestModalMode('create');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const openEditTestModal = (test: CompetitionTest) => {
    setEditingTestId(test.idCompetenciaPrueba);
    setTestForm(createTestFormFromTest(test));
    setTestModalMode('edit');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const openRegistrationModal = (test: CompetitionTest) => {
    setRegistrationTestId(test.idCompetenciaPrueba);
    setRegistrationDraft(createRegistrationDraftFromTest(test));
    setAthleteSearch('');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const openDetailTestModal = (test: CompetitionTest) => {
    setDetailTestId(test.idCompetenciaPrueba);
  };

  const handleCompetitionUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCompetition || !editCompetitionForm) {
      return;
    }

    setBusyKey('update-competition');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const detail = await updateCompetition(
        selectedCompetition.idCompetencia,
        buildCompetitionPayload(editCompetitionForm),
      );
      syncCompetition(detail, 'Datos generales actualizados.');
      setIsEditCompetitionOpen(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setBusyKey(null);
    }
  };

  const handleTestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCompetition) {
      return;
    }

    setBusyKey('save-test');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = buildTestPayload(testForm);
      const detail = editingTestId
        ? await updateCompetitionTest(editingTestId, payload)
        : await createCompetitionTest(selectedCompetition.idCompetencia, payload);

      syncCompetition(
        detail,
        editingTestId ? 'Prueba actualizada correctamente.' : 'Prueba creada correctamente.',
      );
      setTestModalMode(null);
      setEditingTestId(null);
      setTestForm(createEmptyTestFormForCompetition(selectedCompetition));
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setBusyKey(null);
    }
  };

  const handleRegistrationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRegistrationTest || !registrationDraft) {
      return;
    }

    setBusyKey('save-registration');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const detail = await updateCompetitionRegistration(
        selectedRegistrationTest.idCompetenciaPrueba,
        buildRegistrationPayload(registrationDraft),
      );
      syncCompetition(detail, 'Inscripcion guardada correctamente.');
      setRegistrationTestId(null);
      setRegistrationDraft(null);
      setAthleteSearch('');
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setBusyKey(null);
    }
  };

  const addAthleteToRegistration = (athlete: CompetitionAthlete) => {
    setRegistrationDraft((current) => {
      if (!current) {
        return current;
      }

      const nextOrder =
        current.integrantes.reduce(
          (highest, member) => Math.max(highest, Number(member.orden) || 0),
          0,
        ) + 1;

      return {
        ...current,
        integrantes: [
          ...current.integrantes,
          {
            idDeportista: String(athlete.idDeportista),
            orden: String(nextOrder),
            esTimonel: false,
            rolTexto: '',
            observacion: '',
          },
        ],
      };
    });
    setAthleteSearch('');
  };

  const removeAthleteFromRegistration = (idDeportista: string) => {
    setRegistrationDraft((current) =>
      current
        ? {
            ...current,
            integrantes: current.integrantes.filter((member) => member.idDeportista !== idDeportista),
          }
        : current,
    );
  };

  const updateRegistrationMember = (
    idDeportista: string,
    updater: (member: RegistrationMemberDraft) => RegistrationMemberDraft,
  ) => {
    setRegistrationDraft((current) =>
      current
        ? {
            ...current,
            integrantes: current.integrantes.map((member) =>
              member.idDeportista === idDeportista ? updater(member) : member,
            ),
          }
        : current,
    );
  };

  const handleEditCompetitionFormChange = (
    value: SetStateAction<CompetitionFormState>,
  ) => {
    setEditCompetitionForm((current) => {
      if (!current) {
        return current;
      }

      return typeof value === 'function'
        ? (value as (previous: CompetitionFormState) => CompetitionFormState)(current)
        : value;
    });
  };

  const handleClearTestSearch = () => {
    setTestSearchInput('');
    setActiveTestSearch('');
    setTestsPage(1);
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Gestion de competencia</h2>
          <p>
            Trabaja una sola regata a la vez, manteniendo el mismo patron de navegacion
            que usan los otros modulos del sistema.
          </p>
        </div>
      </div>

      {navigationState?.message ? <StatusMessage kind="success" message={navigationState.message} /> : null}
      {successMessage ? <StatusMessage kind="success" message={successMessage} /> : null}
      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando competencia...</p>
        </div>
      ) : !selectedCompetition ? (
        <div className="panel-card">
          <p>No fue posible cargar esta competencia.</p>
        </div>
      ) : (
        <>
          <article className="panel-card competition-overview">
            <div className="competition-overview__header">
              <div className="competition-overview__copy">
                <span className="competition-eyebrow">Competencia activa</span>
                <h3>{selectedCompetition.nombre}</h3>
                <p>
                  {formatCompetitionWindow(selectedCompetition.fechaInicio, selectedCompetition.fechaFin)}
                </p>
              </div>

              <div className="competition-overview__status">
                <div className="competition-overview__status-copy">
                  <strong>{competitionStatusLabels[selectedCompetition.estado]}</strong>
                  <span className="competition-overview__status-meta">
                    Actualizada {formatDateTime(selectedCompetition.fechaActualizacion)}
                  </span>
                </div>
                <button
                  className="button button-primary competition-overview__edit-button"
                  disabled={isCatalogLoading}
                  type="button"
                  onClick={openEditCompetitionModal}
                >
                  Editar competencia
                </button>
              </div>
            </div>

            <div className="competition-kpi-grid">
              <article className="competition-kpi">
                <span>Pruebas</span>
                <strong>{competitionStats.pruebas}</strong>
              </article>
              <article className="competition-kpi">
                <span>Inscripciones nominativas</span>
                <strong>{competitionStats.nominativas}</strong>
              </article>
              <article className="competition-kpi">
                <span>Inscripciones presuntivas</span>
                <strong>{competitionStats.presuntivas}</strong>
              </article>
              <article className="competition-kpi">
                <span>Pruebas master</span>
                <strong>{competitionStats.master}</strong>
              </article>
            </div>

          </article>

          <article className="panel-card">
            <div className="panel-card__header">
              <button className="button button-primary competition-new__test-button" disabled={isCatalogLoading} type="button" 
              onClick={openCreateTestModal}
              >
                Nueva prueba
              </button>
            </div>

            {selectedCompetition.pruebas.length === 0 ? (
              <div className="competition-empty-state">
                <h3>Sin pruebas cargadas</h3>
                <p>Agrega la primera prueba para empezar a construir la regata del club.</p>
              </div>
            ) : (
              <>
                <div className="selection-row">
                  <label className="form-field athlete-search-field">
                    <span>Buscar prueba</span>
                    <input
                      placeholder="Numero, nombre, bote, categoria, genero o modalidad"
                      value={testSearchInput}
                      onChange={(event) => setTestSearchInput(event.target.value)}
                    />
                  </label>

                  <button
                    className="button button-secondary"
                    disabled={!testSearchInput && !activeTestSearch}
                    type="button"
                    onClick={handleClearTestSearch}
                  >
                    Limpiar
                  </button>
                </div>

                <div className="table-toolbar">
                  <p className="form-help">
                    {testsPagination.total} prueba{testsPagination.total === 1 ? '' : 's'} encontradas
                  </p>
                  {activeTestSearch ? (
                    <p className="form-help">
                      Busqueda activa: <strong>{activeTestSearch}</strong>
                    </p>
                  ) : null}
                </div>

                <div className="competition-tests-table__scroll">
                  <table className="data-table competition-tests-table">
                  <thead>
                    <tr>
                      <th>Prueba</th>
                      <th>Bote</th>
                      <th>Categoria</th>
                      <th>Genero</th>
                      <th>Programacion</th>
                      <th>Inscripcion</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testsPagination.items.length === 0 ? (
                      <tr>
                        <td colSpan={7}>No se encontraron pruebas con ese criterio.</td>
                      </tr>
                    ) : (
                      testsPagination.items.map((test) => {
                        const registrationLabel = formatRegistrationLabel(test);
                        const boatLabel = test.requiereBote
                          ? test.tipoBoteNormalizado?.codigo ?? test.tipoBoteOrigen ?? 'Pendiente'
                          : 'No aplica';

                        return (
                          <tr key={test.idCompetenciaPrueba}>
                            <td data-label="Prueba">
                              <strong>
                                #{test.numeroPrueba} Â· {test.nombrePrueba}
                              </strong>
                            </td>
                            <td data-label="Bote">
                              <strong>{boatLabel}</strong>
                            </td>
                            <td data-label="Categoria">
                              <strong>{test.categoria?.nombre ?? test.categoriaOrigen ?? 'Sin categoria'}</strong>
                            </td>
                            <td data-label="Genero">
                              <strong>{test.generoOrigen || 'Sin genero'}</strong>
                            </td>
                            <td data-label="Programacion">
                              <strong>
                                {formatDate(test.fecha ?? '') || 'Sin fecha'}
                                {formatTime(test.hora) ? ` Â· ${formatTime(test.hora)}` : ''}
                              </strong>
                            </td>
                            <td data-label="Inscripcion">
                              <strong>{registrationLabel}</strong>
                            </td>
                            <td data-label="Acciones">
                              <div className="table-actions competition-tests-table__actions">
                                <button className="button button-secondary button-small" type="button" onClick={() => openDetailTestModal(test)}>
                                  Ver detalle
                                </button>
                                <button className="button button-secondary button-small" type="button" onClick={() => openEditTestModal(test)}>
                                  Editar
                                </button>
                                <button className="button button-primary button-small" type="button" onClick={() => openRegistrationModal(test)}>
                                  Inscripcion
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  </table>
                </div>

                {testsPagination.totalPages > 1 ? (
                  <div className="pagination-bar">
                    <button
                      className="button button-secondary button-small"
                      disabled={testsPagination.currentPage <= 1}
                      type="button"
                      onClick={() => setTestsPage((current) => Math.max(current - 1, 1))}
                    >
                      Anterior
                    </button>

                    <div className="pagination-pages">
                      {testPages.map((pageNumber) => (
                        <button
                          key={pageNumber}
                          className={`button button-small ${pageNumber === testsPagination.currentPage ? 'button-primary' : 'button-secondary'}`}
                          type="button"
                          onClick={() => setTestsPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>

                    <button
                      className="button button-secondary button-small"
                      disabled={testsPagination.currentPage >= testsPagination.totalPages}
                      type="button"
                      onClick={() => setTestsPage((current) => Math.min(current + 1, testsPagination.totalPages))}
                    >
                      Siguiente
                    </button>
                  </div>
                ) : null}

                <div className="competition-test-list competition-test-list--legacy">
                {selectedCompetition.pruebas.map((test) => {
                  const memberCount = test.inscripcion?.integrantes.length ?? 0;
                  const registrationLabel = formatRegistrationLabel(test);

                  return (
                    <article key={test.idCompetenciaPrueba} className="competition-test-card">
                      <div className="competition-test-card__header">
                        <div className="competition-test-card__copy">
                          <h4>
                            #{test.numeroPrueba} Â· {test.nombrePrueba}
                          </h4>
                          <span>
                            Orden {test.ordenPrueba} Â· {test.tipoBoteNormalizado?.codigo ?? test.tipoBoteOrigen ?? 'Sin bote normalizado'}
                          </span>
                        </div>

                        <div className="competition-chip-row">
                          <span className="pill neutral">{test.esMaster ? 'Master' : 'General'}</span>
                          <span className="pill neutral">{registrationLabel}</span>
                        </div>
                      </div>

                      <div className="competition-test-card__grid">
                        <div>
                          <dt>Fecha</dt>
                          <dd>
                            {formatDate(test.fecha ?? '') || 'Sin fecha'} {formatTime(test.hora)}
                          </dd>
                        </div>
                        <div>
                          <dt>Distancia</dt>
                          <dd>{test.distancia ? `${test.distancia} m` : 'Sin registrar'}</dd>
                        </div>
                        <div>
                          <dt>Tripulacion</dt>
                          <dd>
                            {test.cantidadTripulantesEsperada
                              ? `${test.cantidadTripulantesEsperada} integrantes`
                              : 'Sin dotacion definida'}
                          </dd>
                        </div>
                        <div>
                          <dt>Bote</dt>
                          <dd>
                            {test.requiereBote
                              ? test.inscripcion?.bote?.nombre ?? test.tipoBoteNormalizado?.codigo ?? 'Pendiente'
                              : 'No aplica'}
                          </dd>
                        </div>
                        <div>
                          <dt>Inscripcion</dt>
                          <dd>
                            {memberCount} integrante{memberCount === 1 ? '' : 's'}
                          </dd>
                        </div>
                        <div>
                          <dt>Observacion</dt>
                          <dd>{test.observacion ?? 'Sin observaciones.'}</dd>
                        </div>
                      </div>

                      {test.inscripcion?.promedioEdad != null ? (
                        <div className="competition-master-card">
                          <strong>Resumen master</strong>
                          <span>
                            Promedio edad: {test.inscripcion.promedioEdad.toFixed(2)} Â· categoria estimada:{' '}
                            {test.inscripcion.categoriaMasterEstimada ?? 'Sin categoria'}
                          </span>
                        </div>
                      ) : null}

                      <div className="competition-test-card__footer">
                        <div className="competition-test-card__status">
                          <span className="pill neutral">
                            {memberCount} integrante{memberCount === 1 ? '' : 's'}
                          </span>
                          <span className="pill neutral">
                            {test.inscripcion?.bote?.nombre ?? (test.requiereBote ? 'Bote pendiente' : 'Sin bote')}
                          </span>
                        </div>

                        <div className="table-actions">
                          <button className="button button-secondary" type="button" onClick={() => openEditTestModal(test)}>
                            Editar prueba
                          </button>
                          <button className="button button-primary" type="button" onClick={() => openRegistrationModal(test)}>
                            Gestionar inscripcion
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
                </div>
              </>
            )}
          </article>
        </>
      )}

      {selectedDetailTest ? (
        <CompetitionModal
          description="Vista resumida de la prueba con acceso rapido a sus datos operativos."
          size="wide"
          title={`Detalle Â· #${selectedDetailTest.numeroPrueba}`}
          onClose={() => setDetailTestId(null)}
        >
          <div className="competition-modal__form">
            <div className="competition-summary-card">
              <strong>{selectedDetailTest.nombrePrueba}</strong>
              <span>
                Orden {selectedDetailTest.ordenPrueba} Â· {selectedDetailTest.tipoBoteNormalizado?.codigo ?? selectedDetailTest.tipoBoteOrigen ?? 'Sin bote definido'}
              </span>
            </div>

            <div className="form-grid">
              <div className="competition-summary-card">
                <strong>Programacion</strong>
                <span>
                  {formatDate(selectedDetailTest.fecha ?? '') || 'Sin fecha'} {formatTime(selectedDetailTest.hora)}
                </span>
              </div>
              <div className="competition-summary-card">
                <strong>Distancia</strong>
                <span>{selectedDetailTest.distancia ? `${selectedDetailTest.distancia} m` : 'Sin registrar'}</span>
              </div>
                  <div className="competition-summary-card">
                    <strong>Categoria y genero</strong>
                    <span>
                      {selectedDetailTest.categoria?.nombre ?? selectedDetailTest.categoriaOrigen ?? 'Sin categoria'} Â· {selectedDetailTest.generoOrigen ?? 'Sin genero'}
                    </span>
                  </div>
              <div className="competition-summary-card">
                <strong>Modalidad</strong>
                <span>{selectedDetailTest.modalidadOrigen ?? 'Sin modalidad'}</span>
              </div>
              <div className="competition-summary-card">
                <strong>Configuracion</strong>
                <span>
                  {selectedDetailTest.cantidadTripulantesEsperada ?? 'Sin dotacion'} integrantes Â· {selectedDetailTest.requiereTimonel ? 'con timonel' : 'sin timonel'}
                </span>
              </div>
              <div className="competition-summary-card">
                <strong>Inscripcion</strong>
                <span>{formatRegistrationLabel(selectedDetailTest)}</span>
              </div>
            </div>

            {selectedDetailTest.observacion ? (
              <div className="competition-summary-card">
                <strong>Observacion</strong>
                <span>{selectedDetailTest.observacion}</span>
              </div>
            ) : null}

            {selectedDetailTest.inscripcion?.promedioEdad != null ? (
              <div className="competition-master-card">
                <strong>Resumen master</strong>
                <span>
                  Promedio edad: {selectedDetailTest.inscripcion.promedioEdad.toFixed(2)} Â· categoria estimada:{' '}
                  {selectedDetailTest.inscripcion.categoriaMasterEstimada ?? 'Sin categoria'}
                </span>
              </div>
            ) : null}

            <div className="form-actions competition-modal__actions">
              <button className="button button-secondary" type="button" onClick={() => setDetailTestId(null)}>
                Cerrar
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setDetailTestId(null);
                  openEditTestModal(selectedDetailTest);
                }}
              >
                Editar prueba
              </button>
              <button
                className="button button-primary"
                type="button"
                onClick={() => {
                  setDetailTestId(null);
                  openRegistrationModal(selectedDetailTest);
                }}
              >
                Gestionar inscripcion
              </button>
            </div>
          </div>
        </CompetitionModal>
      ) : null}

      {isEditCompetitionOpen && editCompetitionForm ? (
        <CompetitionModal
          description="Ajusta los datos generales sin salir del flujo de gestion."
          size="wide"
          title="Editar competencia"
          onClose={() => !isUpdateBusy && setIsEditCompetitionOpen(false)}
        >
          <form className="competition-modal__form" onSubmit={handleCompetitionUpdate}>
            <CompetitionFormFields
              catalogs={catalogs}
              form={editCompetitionForm}
              onChange={handleEditCompetitionFormChange}
            />

            <div className="form-actions competition-modal__actions">
              <button className="button button-secondary" disabled={isUpdateBusy} type="button" onClick={() => setIsEditCompetitionOpen(false)}>
                Cancelar
              </button>
              <button className="button button-primary" disabled={isUpdateBusy} type="submit">
                {isUpdateBusy ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </CompetitionModal>
      ) : null}

      {testModalMode && selectedCompetition ? (
        <CompetitionModal
          description={testModalMode === 'edit' ? 'Corrige el programa de la competencia.' : 'Agrega una prueba manual al programa oficial del club.'}
          size="wide"
          title={testModalMode === 'edit' ? 'Editar prueba' : 'Nueva prueba'}
          onClose={() => !isTestBusy && setTestModalMode(null)}
        >
          <form className="competition-modal__form" onSubmit={handleTestSubmit}>
            <CompetitionTestFormFields
              catalogs={catalogs}
              competitionEndDate={selectedCompetition.fechaFin}
              competitionStartDate={selectedCompetition.fechaInicio}
              competitionType={selectedCompetition.tipoCompetencia}
              form={testForm}
              mode={testModalMode}
              onChange={setTestForm}
            />

            <div className="form-actions competition-modal__actions">
              <button className="button button-secondary" disabled={isTestBusy} type="button" onClick={() => setTestModalMode(null)}>
                Cancelar
              </button>
              <button className="button button-primary" disabled={isTestBusy} type="submit">
                {isTestBusy ? 'Guardando...' : testModalMode === 'edit' ? 'Guardar cambios' : 'Crear prueba'}
              </button>
            </div>
          </form>
        </CompetitionModal>
      ) : null}

      {selectedRegistrationTest && registrationDraft ? (
        <CompetitionModal
          description="Completa la tripulacion del club y marca la inscripcion como presuntiva o nominativa segun corresponda."
          size="wide"
          title={`Inscripcion Â· #${selectedRegistrationTest.numeroPrueba}`}
          onClose={closeRegistrationModal}
        >
          <form className="competition-registration-layout" onSubmit={handleRegistrationSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span>Estado</span>
                <select
                  value={registrationDraft.estado}
                  onChange={(event) =>
                    setRegistrationDraft((current) =>
                      current ? { ...current, estado: event.target.value as CompetitionRegistrationStatus } : current,
                    )
                  }
                >
                  {catalogs?.estadosInscripcion.map((item) => (
                    <option key={item} value={item}>
                      {competitionRegistrationStatusLabels[item]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Bote asignado</span>
                <select
                  disabled={!selectedRegistrationTest.requiereBote}
                  value={registrationDraft.idBote}
                  onChange={(event) =>
                    setRegistrationDraft((current) => (current ? { ...current, idBote: event.target.value } : current))
                  }
                >
                  <option value="">Sin asignar</option>
                  {registrationBoats.map((boat) => (
                    <option key={boat.idBote} value={boat.idBote}>
                      {boat.nombre}
                    </option>
                  ))}
                </select>
                {selectedRegistrationTest.requiereBote ? (
                  <small>
                    {selectedRegistrationTest.tipoBoteNormalizado?.codigo
                      ? `Solo se listan botes ${selectedRegistrationTest.tipoBoteNormalizado.codigo}.`
                      : 'Solo se listan botes compatibles con la prueba.'}
                  </small>
                ) : (
                  <small>Esta prueba no requiere asignar bote.</small>
                )}
              </label>
            </div>

            <label className="form-field">
              <span>Buscar deportista</span>
              <input
                placeholder={
                  selectedRegistrationCategoryLabel
                    ? `Nombre o RUT de categoria ${selectedRegistrationCategoryLabel}`
                    : 'Nombre o RUT'
                }
                value={athleteSearch}
                onChange={(event) => setAthleteSearch(event.target.value)}
              />
              <small>
                {selectedRegistrationCategoryLabel
                  ? `Solo se permiten deportistas de la categoria ${selectedRegistrationCategoryLabel}.`
                  : 'Busca al deportista por nombre o RUT.'}
              </small>
            </label>

            {athleteSearch.trim() ? (
              <div className="search-results competition-search-results">
                {availableAthletes.length > 0 ? (
                  availableAthletes.slice(0, 8).map((athlete) => (
                    <button key={athlete.idDeportista} className="search-result" type="button" onClick={() => addAthleteToRegistration(athlete)}>
                      <strong>{athlete.nombre}</strong>
                      <span>
                        {athlete.rut}
                        {athlete.categoriaVigente?.nombre ? ` Â· ${athlete.categoriaVigente.nombre}` : ''}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="form-help">No hay deportistas disponibles para esa busqueda en la categoria permitida.</p>
                )}
              </div>
            ) : null}

            <div className="competition-registration-members">
              {registrationDraft.integrantes.length === 0 ? (
                <p className="form-help">Aun no agregas integrantes a esta inscripcion.</p>
              ) : (
                registrationDraft.integrantes.map((member) => {
                  const athlete = catalogs?.deportistas.find((item) => String(item.idDeportista) === member.idDeportista);

                  return (
                    <div key={member.idDeportista} className="subform-card">
                      <div className="section-heading">
                        <div>
                          <h4>{athlete?.nombre ?? `Deportista ${member.idDeportista}`}</h4>
                          <p className="form-help">{athlete?.rut ?? 'Sin RUT disponible'}</p>
                        </div>

                        <button className="button button-danger button-small" type="button" onClick={() => removeAthleteFromRegistration(member.idDeportista)}>
                          Quitar
                        </button>
                      </div>

                      <div className="form-grid">
                        <label className="form-field">
                          <span>Orden</span>
                          <input
                            min="1"
                            type="number"
                            value={member.orden}
                            onChange={(event) =>
                              updateRegistrationMember(member.idDeportista, (current) => ({ ...current, orden: event.target.value }))
                            }
                          />
                        </label>

                        <label className="form-field">
                          <span>Rol</span>
                          <input
                            value={member.rolTexto}
                            onChange={(event) =>
                              updateRegistrationMember(member.idDeportista, (current) => ({ ...current, rolTexto: event.target.value }))
                            }
                          />
                        </label>

                        <label className="switch-field competitions-switch">
                          <input
                            checked={member.esTimonel}
                            type="checkbox"
                            onChange={(event) =>
                              updateRegistrationMember(member.idDeportista, (current) => ({ ...current, esTimonel: event.target.checked }))
                            }
                          />
                          <span>Marcar como timonel</span>
                        </label>

                        <label className="form-field">
                          <span>Observacion</span>
                          <input
                            value={member.observacion}
                            onChange={(event) =>
                              updateRegistrationMember(member.idDeportista, (current) => ({ ...current, observacion: event.target.value }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedRegistrationTest.inscripcion?.promedioEdad != null ? (
              <div className="competition-master-card">
                <strong>Ultimo calculo master</strong>
                <span>
                  Promedio edad: {selectedRegistrationTest.inscripcion.promedioEdad.toFixed(2)} Â· categoria estimada:{' '}
                  {selectedRegistrationTest.inscripcion.categoriaMasterEstimada ?? 'Sin categoria'}
                </span>
              </div>
            ) : null}

            <div className="form-actions competition-modal__actions">
              <button className="button button-secondary" disabled={isRegistrationBusy} type="button" onClick={closeRegistrationModal}>
                Cerrar
              </button>
              <button className="button button-primary" disabled={isRegistrationBusy} type="submit">
                {isRegistrationBusy ? 'Guardando...' : 'Guardar inscripcion'}
              </button>
            </div>
          </form>
        </CompetitionModal>
      ) : null}
    </section>
  );
}

