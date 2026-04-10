import { Navigate, useParams } from 'react-router-dom';

export function UserEnableAccessPage() {
  const params = useParams();
  const userId = params.id;

  if (!userId) {
    return <Navigate replace to="/usuarios" />;
  }

  return <Navigate replace to={`/usuarios/${userId}/editar`} />;
}
