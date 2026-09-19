import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteEmployee, getEmployees, searchEmployees } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';

export default function EmployeeList() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback((term) => {
    setLoading(true);
    setError('');
    const request = term ? searchEmployees(term) : getEmployees();
    request
      .then(setEmployees)
      .catch(() => setError('Could not load employees.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(keyword.trim());
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Remove ${employee.firstName} ${employee.lastName} from the register?`)) {
      return;
    }
    setDeletingId(employee.id);
    try {
      await deleteEmployee(employee.id);
      setEmployees((prev) => prev.filter((e) => e.id !== employee.id));
    } catch {
      setError('Could not delete that employee.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>{employees.length} on record</p>
        </div>
        {isAdmin && (
          <Link to="/employees/new" className="btn btn-primary">
            Add employee
          </Link>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <form className="row" onSubmit={handleSearch}>
            <input
              className="search-input"
              placeholder="Search by first or last name"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
            {keyword && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setKeyword('');
                  load('');
                }}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        <div className="panel-body" style={{ padding: 0 }}>
          {error && (
            <div className="alert alert-error" style={{ margin: 'var(--space-4)' }}>
              {error}
            </div>
          )}

          {loading ? (
            <p className="loading-text" style={{ padding: 'var(--space-4)' }}>
              Loading employees…
            </p>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <h3>No employees found</h3>
              <p>{keyword ? 'Try a different search.' : 'Add the first employee to get started.'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Salary</th>
                    <th>Joined</th>
                    {isAdmin && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="cell-name">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="cell-muted">{employee.email}</div>
                      </td>
                      <td>{employee.departmentName}</td>
                      <td>{employee.designation || '—'}</td>
                      <td className="tabular">
                        {employee.salary != null ? `₹${employee.salary.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="cell-muted">{employee.dateOfJoining || '—'}</td>
                      {isAdmin && (
                        <td>
                          <div className="cell-actions">
                            <Link to={`/employees/${employee.id}/edit`} className="btn btn-ghost btn-sm">
                              Edit
                            </Link>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)' }}
                              disabled={deletingId === employee.id}
                              onClick={() => handleDelete(employee)}
                            >
                              {deletingId === employee.id ? 'Removing…' : 'Delete'}
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
