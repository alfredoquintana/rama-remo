import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { deleteUser, getUsers } from '../services/users';
import type { User } from '../types/users';
import { formatRoleList } from '../utils/text';

type NavigationState = {
  message?: string;
};

export function UsersListPage() {
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    getUsers()
      .then((data) => {
        setUsers(data);
        setErrorMessage('');
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const navigationState = (location.state as NavigationState | null) ?? null;

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar a ${user.nombre}? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteUser(user.idUsuario);
      setUsers((current) =>
        current.filter((currentUser) => currentUser.idUsuario !== user.idUsuario),
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
          <h2>Usuarios</h2>
          <p>Listado general de personas con sus roles asignados.</p>
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
        {isLoading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Teléfono</th>
                <th>Roles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.idUsuario}>
                  <td data-label="Nombre">{user.nombre}</td>
                  <td data-label="RUT">{user.rut}</td>
                  <td data-label="Teléfono">{user.telefono}</td>
                  <td data-label="Roles">{formatRoleList(user.roles)}</td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
