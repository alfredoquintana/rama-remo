import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { useDebouncedValue } from '../hooks';
import { deleteUser, getUsersPage } from '../services/users';
import type { User, UsersListResponse } from '../types/users';
import { formatRoleList, toTitleCaseLabel } from '../utils/text';

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

export function UsersListPage() {
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Omit<UsersListResponse, 'items'> | null>(
    null,
  );
  const [refreshToken, setRefreshToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    getUsersPage({
      page,
      pageSize: PAGE_SIZE,
      search: activeSearch,
    })
      .then((data) => {
        setUsers(data.items);
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
  }, [activeSearch, page, refreshToken]);

  const navigationState = (location.state as NavigationState | null) ?? null;
  const pages = buildPagination(page, pagination?.totalPages ?? 1);
  const hasNoMatches = !isLoading && activeSearch.length > 0 && users.length === 0;

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `Vas a eliminar al usuario "${toTitleCaseLabel(user.nombre)}" y su acceso asociado si existe. Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteUser(user.idUsuario);
      setSuccessMessage(response.message);
      setErrorMessage('');

      if (users.length === 1 && page > 1) {
        setIsLoading(true);
        setPage((current) => Math.max(current - 1, 1));
        return;
      }

      setIsLoading(true);
      setRefreshToken((current) => current + 1);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setSuccessMessage('');
    }
  };

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
          <h2>Usuarios</h2>
          <p>Listado general de personas, con o sin acceso al sistema.</p>
        </div>
        <Link className="button button-primary" to="/usuarios/nuevo">
          Crear usuario
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
        <div className="selection-row">
          <label className="form-field athlete-search-field">
            <span>Buscar usuario</span>
            <input
              placeholder="Nombre, RUT, teléfono o rol"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>

          <button
            className="button button-secondary"
            disabled={!searchInput && !activeSearch}
            type="button"
            onClick={handleClearSearch}
          >
            Limpiar
          </button>
        </div>

        <div className="table-toolbar">
          <p className="form-help">
            {pagination
              ? `${pagination.total} usuario${pagination.total === 1 ? '' : 's'} registrados`
              : 'Cargando resultados...'}
          </p>

          {activeSearch ? (
            <p className="form-help">
              Búsqueda activa: <strong>{activeSearch}</strong>
            </p>
          ) : null}
        </div>

        {hasNoMatches ? (
          <StatusMessage
            kind="error"
            message={`No se encontraron resultados para "${activeSearch}".`}
          />
        ) : null}

        {isLoading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Teléfono</th>
                  <th>Acceso</th>
                  <th>Roles</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      {activeSearch
                        ? 'No se encontraron resultados según la búsqueda.'
                        : 'No hay usuarios registrados.'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.idUsuario}>
                      <td data-label="Nombre">{toTitleCaseLabel(user.nombre)}</td>
                      <td data-label="RUT">{user.rut}</td>
                      <td data-label="Teléfono">{user.telefono}</td>
                      <td data-label="Acceso">
                        {user.accesoHabilitado ? 'Habilitado' : 'Sin acceso'}
                      </td>
                      <td data-label="Roles">
                        {user.roles.length > 0 ? formatRoleList(user.roles) : 'Sin roles'}
                      </td>
                      <td data-label="Acciones">
                        <div className="table-actions">
                          <Link
                            className="button button-secondary button-small"
                            to={`/usuarios/${user.idUsuario}/editar`}
                          >
                            Editar
                          </Link>
                          <button
                            className="button button-danger button-small"
                            onClick={() => void handleDelete(user)}
                            type="button"
                          >
                            Eliminar
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
                    setPage((current) => Math.min(current + 1, pagination.totalPages));
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
