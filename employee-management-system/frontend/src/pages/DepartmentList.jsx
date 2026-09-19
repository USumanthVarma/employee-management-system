import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteDepartment, getDepartments } from '../api/departmentApi';
import { useAuth } from '../context/AuthContext';

export default function DepartmentList() {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    getDepartments()
      .then(setDepartments)
      .catch(() => setError('Could not load departments.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (dept) => {
    if (
      !window.confirm(
        dept.employeeCount > 0
          ? `${dept.name} still has ${dept.employeeCount} employee(s) assigned. Delete it anyway?`
          : `Delete ${dept.name}?`
      )
    ) {
      return;
    }
    setDeletingId(dept.id);
    try {
      await deleteDepartment(dept.id);
      setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete that department.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Departments</h1>
          <p>{departments.length} on record</p>
        </div>
        {isAdmin && (
          <Link to="/departments/new" className="btn btn-primary">
            Add department
          </Link>
        )}
      </div>

      <div className="panel">
        <div className="panel-body" style={{ padding: 0 }}>
          {error && (
            <div className="alert alert-error" style={{ margin: 'var(--space-4)' }}>
              {error}
            </div>
          )}

          {loading ? (
            <p className="loading-text" style={{ padding: 'var(--space-4)' }}>
              Loading departments…
            </p>
          ) : departments.length === 0 ? (
            <div className="empty-state">
              <h3>No departments yet</h3>
              <p>Add one before you start adding employees.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Headcount</th>
                    {isAdmin && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td className="cell-name">{dept.name}</td>
                      <td className="cell-muted">{dept.location || '—'}</td>
                      <td className="tabular">{dept.employeeCount}</td>
                      {isAdmin && (
                        <td>
                          <div className="cell-actions">
                            <Link to={`/departments/${dept.id}/edit`} className="btn btn-ghost btn-sm">
                              Edit
                            </Link>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)' }}
                              disabled={deletingId === dept.id}
                              onClick={() => handleDelete(dept)}
                            >
                              {deletingId === dept.id ? 'Removing…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
