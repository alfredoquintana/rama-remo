import { useEffect, useState, type FormEvent } from 'react';
import { StatusMessage } from '../components/StatusMessage';
import {
  createBoat,
  getBoat,
  getFleet,
  getFleetCatalogs,
  updateBoat,
} from '../services/fleet';
import type {
  Boat,
  BoatDetail,
  BoatPayload,
  BoatState,
  BoatType,
  FleetCatalogsResponse,
  FleetListResponse,
} from '../types/fleet';
import { toTitleCaseLabel } from '../utils/text';

const PAGE_SIZE = 10;

type FleetFilterForm = {
  search: string;
  idTipoBote: string;
  idEstadoBote: string;
  activo: string;
};

type BoatFormValues = {
  idTipoBote: string;
  idEstadoBote: string;
  nombre: string;
  marca: string;
  anio: string;
  observacion: string;
  activo: boolean;
};

type FleetModalMode = 'create' | 'edit' | 'detail' | null;

function buildPagination(currentPage: number, totalPages: number) {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return [...pages].sort((first, second) => first - second);
}

function createEmptyBoatForm(catalogs: FleetCatalogsResponse | null): BoatFormValues {
  return {
    idTipoBote: String(catalogs?.tiposBote[0]?.idTipoBote ?? ''),
    idEstadoBote: String(catalogs?.estadosBote[0]?.idEstadoBote ?? ''),
    nombre: '',
    marca: '',
    anio: '',
    observacion: '',
    activo: true,
  };
}

function createBoatFormFromDetail(boat: BoatDetail): BoatFormValues {
  return {
    idTipoBote: String(boat.tipoBote.idTipoBote),
    idEstadoBote: String(boat.estadoBote.idEstadoBote),
    nombre: boat.nombre,
    marca: boat.marca ?? '',
    anio: boat.anio ? String(boat.anio) : '',
    observacion: boat.observacion ?? '',
    activo: boat.activo,
  };
}

function buildBoatPayload(values: BoatFormValues): BoatPayload {
  return {
    idTipoBote: Number(values.idTipoBote),
    idEstadoBote: Number(values.idEstadoBote),
    nombre: values.nombre.trim(),
    marca: values.marca.trim() || undefined,
    anio: values.anio.trim() ? Number(values.anio) : undefined,
    observacion: values.observacion.trim() || undefined,
    activo: values.activo,
  };
}

function describeActiveFilter(value: string) {
  if (value === 'true') {
    return 'Solo activos';
  }

  if (value === 'false') {
    return 'Solo inactivos';
  }

  return 'Todos';
}

export function FleetPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [catalogs, setCatalogs] = useState<FleetCatalogsResponse | null>(null);
  const [filters, setFilters] = useState<FleetFilterForm>({
    search: '',
    idTipoBote: '',
    idEstadoBote: '',
    activo: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<FleetFilterForm>({
    search: '',
    idTipoBote: '',
    idEstadoBote: '',
    activo: '',
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Omit<FleetListResponse, 'items'> | null>(
    null,
  );
  const [refreshToken, setRefreshToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalMode, setModalMode] = useState<FleetModalMode>(null);
  const [selectedBoat, setSelectedBoat] = useState<BoatDetail | null>(null);
  const [boatForm, setBoatForm] = useState<BoatFormValues>(
    createEmptyBoatForm(null),
  );
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getFleetCatalogs()
      .then((data) => {
        setCatalogs(data);
        setBoatForm(createEmptyBoatForm(data));
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsCatalogLoading(false);
      });
  }, []);

  useEffect(() => {
    setIsLoading(true);

    getFleet({
      page,
      pageSize: PAGE_SIZE,
      search: appliedFilters.search,
      idTipoBote: appliedFilters.idTipoBote
        ? Number(appliedFilters.idTipoBote)
        : undefined,
      idEstadoBote: appliedFilters.idEstadoBote
        ? Number(appliedFilters.idEstadoBote)
        : undefined,
      activo:
        appliedFilters.activo === ''
          ? undefined
          : appliedFilters.activo === 'true',
    })
      .then((data) => {
        setBoats(data.items);
        setPagination({
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          totalPages: data.totalPages,
          search: data.search,
          idTipoBote: data.idTipoBote,
          idEstadoBote: data.idEstadoBote,
          activo: data.activo,
        });
        setErrorMessage('');
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [appliedFilters, page, refreshToken]);

  const pages = buildPagination(page, pagination?.totalPages ?? 1);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setPage(1);
    setAppliedFilters({
      search: filters.search.trim(),
      idTipoBote: filters.idTipoBote,
      idEstadoBote: filters.idEstadoBote,
      activo: filters.activo,
    });
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      idTipoBote: '',
      idEstadoBote: '',
      activo: '',
    };

    setIsLoading(true);
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setPage(1);
  };

  const openCreateModal = () => {
    setBoatForm(createEmptyBoatForm(catalogs));
    setSelectedBoat(null);
    setSuccessMessage('');
    setErrorMessage('');
    setModalMode('create');
  };

  const openEditModal = async (boatId: number) => {
    setIsModalLoading(true);
    setModalMode('edit');
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const boat = await getBoat(boatId);
      setSelectedBoat(boat);
      setBoatForm(createBoatFormFromDetail(boat));
    } catch (error) {
      setErrorMessage((error as Error).message);
      setModalMode(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  const openDetailModal = async (boatId: number) => {
    setIsModalLoading(true);
    setModalMode('detail');
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const boat = await getBoat(boatId);
      setSelectedBoat(boat);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setModalMode(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setModalMode(null);
    setSelectedBoat(null);
    setIsModalLoading(false);
  };

  const handleBoatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = buildBoatPayload(boatForm);

      if (modalMode === 'edit' && selectedBoat) {
        await updateBoat(selectedBoat.idBote, payload);
        setSuccessMessage('Bote actualizado correctamente.');
      } else {
        await createBoat(payload);
        setSuccessMessage('Bote registrado correctamente.');
      }

      setModalMode(null);
      setSelectedBoat(null);
      setRefreshToken((current) => current + 1);
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
          <h2>Flota</h2>
          <p>Gestiona los botes del club, su tipo, estado operativo y detalle general.</p>
        </div>
        <button
          className="button button-primary"
          disabled={isCatalogLoading}
          type="button"
          onClick={openCreateModal}
        >
          Registrar bote
        </button>
      </div>

      {successMessage ? <StatusMessage kind="success" message={successMessage} /> : null}
      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      <div className="panel-card">
        <form className="selection-row fleet-page__filters" onSubmit={handleSearchSubmit}>
          <label className="form-field fleet-search-field">
            <span>Buscar bote</span>
            <input
              placeholder="Nombre, marca, tipo o estado"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
            />
          </label>

          <label className="form-field fleet-filter-field">
            <span>Tipo de bote</span>
            <select
              disabled={isCatalogLoading}
              value={filters.idTipoBote}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  idTipoBote: event.target.value,
                }))
              }
            >
              <option value="">Todos</option>
              {catalogs?.tiposBote.map((tipoBote) => (
                <option key={tipoBote.idTipoBote} value={tipoBote.idTipoBote}>
                  {tipoBote.codigo} - {tipoBote.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field fleet-filter-field">
            <span>Estado</span>
            <select
              disabled={isCatalogLoading}
              value={filters.idEstadoBote}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  idEstadoBote: event.target.value,
                }))
              }
            >
              <option value="">Todos</option>
              {catalogs?.estadosBote.map((estadoBote) => (
                <option
                  key={estadoBote.idEstadoBote}
                  value={estadoBote.idEstadoBote}
                >
                  {estadoBote.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field fleet-filter-field">
            <span>Activo</span>
            <select
              value={filters.activo}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  activo: event.target.value,
                }))
              }
            >
              <option value="">Todos</option>
              <option value="true">Solo activos</option>
              <option value="false">Solo inactivos</option>
            </select>
          </label>

          <button className="button button-primary" disabled={isLoading} type="submit">
            Buscar
          </button>

          <button
            className="button button-secondary"
            disabled={
              isLoading ||
              (!filters.search &&
                !filters.idTipoBote &&
                !filters.idEstadoBote &&
                !filters.activo)
            }
            type="button"
            onClick={handleClearFilters}
          >
            Limpiar
          </button>
        </form>

        <div className="table-toolbar">
          <p className="form-help">
            {pagination
              ? `${pagination.total} bote${pagination.total === 1 ? '' : 's'} encontrados`
              : 'Cargando resultados...'}
          </p>

          <div className="fleet-page__summary">
            {appliedFilters.search ? (
              <p className="form-help">
                Búsqueda activa: <strong>{appliedFilters.search}</strong>
              </p>
            ) : null}
            {(appliedFilters.idTipoBote || appliedFilters.idEstadoBote || appliedFilters.activo) ? (
              <p className="form-help">
                Filtros: {describeActiveFilter(appliedFilters.activo)}
              </p>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <p>Cargando flota...</p>
        ) : (
          <>
            <table className="data-table fleet-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Marca</th>
                  <th>Año</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {boats.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No se encontraron botes con ese criterio.</td>
                  </tr>
                ) : (
                  boats.map((boat) => (
                    <tr key={boat.idBote}>
                      <td data-label="Nombre">{toTitleCaseLabel(boat.nombre)}</td>
                      <td data-label="Tipo">
                        {boat.tipoBote.codigo} - {boat.tipoBote.nombre}
                      </td>
                      <td data-label="Estado">{boat.estadoBote.nombre}</td>
                      <td data-label="Marca">
                        {boat.marca ? boat.marca.toUpperCase() : '-'}
                      </td>
                      <td data-label="Año">{boat.anio ?? '-'}</td>
                      <td data-label="Activo">
                        <span className={`pill ${boat.activo ? 'success' : 'neutral'}`}>
                          {boat.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <div className="table-actions fleet-table__actions">
                          <button
                            className="button button-secondary button-small"
                            type="button"
                            onClick={() => void openDetailModal(boat.idBote)}
                          >
                            Ver detalle
                          </button>
                          <button
                            className="button button-secondary button-small"
                            type="button"
                            onClick={() => void openEditModal(boat.idBote)}
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {pagination && pagination.totalPages > 1 ? (
              <div className="pagination-bar">
                <button
                  className="button button-secondary button-small"
                  disabled={page <= 1}
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setPage((current) => Math.max(current - 1, 1));
                  }}
                >
                  Anterior
                </button>

                <div className="pagination-pages">
                  {pages.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`button button-small ${pageNumber === page ? 'button-primary' : 'button-secondary'}`}
                      type="button"
                      onClick={() => {
                        setIsLoading(true);
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <button
                  className="button button-secondary button-small"
                  disabled={page >= pagination.totalPages}
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setPage((current) =>
                      Math.min(current + 1, pagination.totalPages),
                    );
                  }}
                >
                  Siguiente
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {modalMode ? (
        <div className="fleet-modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            aria-modal="true"
            className="fleet-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="fleet-modal__header">
              <div>
                <h3>
                  {modalMode === 'create'
                    ? 'Registrar bote'
                    : modalMode === 'edit'
                      ? 'Editar bote'
                      : 'Detalle del bote'}
                </h3>
                <p className="form-help">
                  {modalMode === 'detail'
                    ? 'Consulta la información general del bote y su estado actual.'
                    : 'Completa la información del bote respetando el catálogo de tipos y estados.'}
                </p>
              </div>

              <button
                aria-label="Cerrar gestión de flota"
                className="app-header__account-close"
                type="button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {isModalLoading ? (
              <p>Cargando información del bote...</p>
            ) : modalMode === 'detail' && selectedBoat ? (
              <div className="fleet-detail-grid">
                <label className="form-field">
                  <span>Nombre</span>
                  <input readOnly value={toTitleCaseLabel(selectedBoat.nombre)} />
                </label>

                <label className="form-field">
                  <span>Tipo de bote</span>
                  <input
                    readOnly
                    value={`${selectedBoat.tipoBote.codigo} - ${selectedBoat.tipoBote.nombre}`}
                  />
                </label>

                <label className="form-field">
                  <span>Estado</span>
                  <input readOnly value={selectedBoat.estadoBote.nombre} />
                </label>

                <label className="form-field">
                  <span>Permite uso</span>
                  <input
                    readOnly
                    value={selectedBoat.estadoBote.permiteUso ? 'Sí' : 'No'}
                  />
                </label>

                <label className="form-field">
                  <span>Marca</span>
                  <input readOnly value={selectedBoat.marca?.toUpperCase() ?? ''} />
                </label>

                <label className="form-field">
                  <span>Año</span>
                  <input readOnly value={selectedBoat.anio ? String(selectedBoat.anio) : ''} />
                </label>

                <label className="form-field">
                  <span>Requiere timonel</span>
                  <input
                    readOnly
                    value={selectedBoat.tipoBote.requiereTimonel ? 'Sí' : 'No'}
                  />
                </label>

                <label className="form-field">
                  <span>Activo</span>
                  <input readOnly value={selectedBoat.activo ? 'Sí' : 'No'} />
                </label>

                <label className="form-field form-field--full">
                  <span>Observación</span>
                  <textarea readOnly rows={4} value={selectedBoat.observacion ?? ''} />
                </label>
              </div>
            ) : (
              <form className="fleet-modal__form" onSubmit={handleBoatSubmit}>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Nombre</span>
                    <input
                      required
                      value={boatForm.nombre}
                      onChange={(event) =>
                        setBoatForm((current) => ({
                          ...current,
                          nombre: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-field">
                    <span>Marca</span>
                    <input
                      value={boatForm.marca}
                      onChange={(event) =>
                        setBoatForm((current) => ({
                          ...current,
                          marca: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-field">
                    <span>Tipo de bote</span>
                    <select
                      required
                      value={boatForm.idTipoBote}
                      onChange={(event) =>
                        setBoatForm((current) => ({
                          ...current,
                          idTipoBote: event.target.value,
                        }))
                      }
                    >
                      {catalogs?.tiposBote.map((tipoBote: BoatType) => (
                        <option key={tipoBote.idTipoBote} value={tipoBote.idTipoBote}>
                          {tipoBote.codigo} - {tipoBote.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Estado</span>
                    <select
                      required
                      value={boatForm.idEstadoBote}
                      onChange={(event) =>
                        setBoatForm((current) => ({
                          ...current,
                          idEstadoBote: event.target.value,
                        }))
                      }
                    >
                      {catalogs?.estadosBote.map((estadoBote: BoatState) => (
                        <option
                          key={estadoBote.idEstadoBote}
                          value={estadoBote.idEstadoBote}
                        >
                          {estadoBote.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Año</span>
                    <input
                      max="2100"
                      min="1900"
                      type="number"
                      value={boatForm.anio}
                      onChange={(event) =>
                        setBoatForm((current) => ({
                          ...current,
                          anio: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="switch-field fleet-modal__switch">
                    <input
                      checked={boatForm.activo}
                      type="checkbox"
                      onChange={(event) =>
                        setBoatForm((current) => ({
                          ...current,
                          activo: event.target.checked,
                        }))
                      }
                    />
                    <span>Bote activo</span>
                  </label>

                  <label className="form-field form-field--full">
                    <span>Observación</span>
                    <textarea
                      rows={4}
                      value={boatForm.observacion}
                      onChange={(event) =>
                        setBoatForm((current) => ({
                          ...current,
                          observacion: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    className="button button-secondary"
                    disabled={isSubmitting}
                    type="button"
                    onClick={closeModal}
                  >
                    Cancelar
                  </button>
                  <button className="button button-primary" disabled={isSubmitting} type="submit">
                    {isSubmitting
                      ? 'Guardando...'
                      : modalMode === 'edit'
                        ? 'Guardar cambios'
                        : 'Guardar bote'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
