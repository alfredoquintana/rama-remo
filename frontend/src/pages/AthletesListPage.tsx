import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { useDebouncedValue } from '../hooks';
import { getAthletes } from '../services/athletes';
import type { Athlete, AthletesListResponse } from '../types/athletes';
import { formatDate } from '../utils/dateTime';

type NavigationState = {
  message?: string;
};

const PAGE_SIZE = 10;

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

export function AthletesListPage() {
  const location = useLocation();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Omit<
    AthletesListResponse,
    'items'
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const debouncedSearchInput = useDebouncedValue(searchInput, 350);

  useEffect(() => {
    const nextSearch = debouncedSearchInput.trim();

    if (nextSearch === activeSearch) {
      return;
    }

    setIsLoading(true);
    setPage(1);
    setActiveSearch(nextSearch);
  }, [activeSearch, debouncedSearchInput]);

  useEffect(() => {
    getAthletes({
      page,
      pageSize: PAGE_SIZE,
      search: activeSearch,
    })
      .then((data) => {
        setAthletes(data.items);
        setPagination({
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          totalPages: data.totalPages,
          search: data.search,
        });
        setErrorMessage('');
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeSearch, page]);

  const navigationState = (location.state as NavigationState | null) ?? null;
  const pages = buildPagination(page, pagination?.totalPages ?? 1);

  const handleClearSearch = () => {
    setIsLoading(true);
    setSearchInput('');
    setActiveSearch('');
    setPage(1);
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Deportistas</h2>
          <p>Listado de deportistas activos con su categoría vigente e historial disponible.</p>
        </div>
        <Link className="button button-primary" to="/deportistas/nuevo">
          Registrar deportista
        </Link>
      </div>

      {navigationState?.message ? (
        <StatusMessage kind="success" message={navigationState.message} />
      ) : null}

      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      <div className="panel-card">
        <div className="selection-row">
          <label className="form-field athlete-search-field">
            <span>Buscar deportista</span>
            <input
              placeholder="Nombre, RUT o categoría"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>

          <button
            className="button button-secondary"
            disabled={!activeSearch && !searchInput}
            type="button"
            onClick={handleClearSearch}
          >
            Limpiar
          </button>
        </div>

        <div className="table-toolbar">
          <p className="form-help">
            {isLoading && !pagination
              ? 'Cargando resultados...'
              : `${pagination?.total ?? 0} deportista${pagination?.total === 1 ? '' : 's'} encontrados`}
          </p>
          {activeSearch ? (
            <p className="form-help">
              Búsqueda activa: <strong>{activeSearch}</strong>
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <p>Cargando deportistas...</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Categoría vigente</th>
                  <th>Desde</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {athletes.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No se encontraron deportistas con ese criterio.</td>
                  </tr>
                ) : (
                  athletes.map((athlete) => (
                    <tr key={athlete.idDeportista}>
                      <td data-label="Nombre">{athlete.usuario.nombre}</td>
                      <td data-label="RUT">{athlete.usuario.rut}</td>
                      <td data-label="Categoría vigente">
                        {athlete.categoriaVigente?.categoria.nombre ?? 'Sin categoría'}
                      </td>
                      <td data-label="Desde">
                        {athlete.categoriaVigente
                          ? formatDate(athlete.categoriaVigente.fechaDesde)
                          : '-'}
                      </td>
                      <td data-label="Acciones">
                        <div className="table-actions">
                          <Link
                            className="button button-secondary button-small"
                            to={`/deportistas/${athlete.idDeportista}`}
                          >
                            Ver historial
                          </Link>
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
    </section>
  );
}
