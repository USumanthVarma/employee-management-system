import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees } from '../api/employeeApi';
import { getDepartments } from '../api/departmentApi';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.all([getEmployees(), getDepartments()])
      .then(([employeeData, departmentData]) => {
        if (cancelled) return;
        setEmployees(employeeData);
        setDepartments(departmentData);
      })
      .catch(() => !cancelled && setError('Could not load the dashboard data.'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="loading-text">Loading dashboard…</p>;

  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const avgSalary = employees.length ? Math.round(totalSalary / employees.length) : 0;
  const maxHeadcount = Math.max(1, ...departments.map((d) => d.employeeCount));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>A snapshot of the current register.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <div className="stat-panel">
          <div className="value tabular">{employees.length}</div>
          <div className="label">Employees on record</div>
        </div>
        <div className="stat-panel">
          <div className="value tabular">{departments.length}</div>
          <div className="label">Departments</div>
        </div>
        <div className="stat-panel">
          <div className="value tabular">₹{avgSalary.toLocaleString('en-IN')}</div>
          <div className="label">Average salary</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Headcount by department</h2>
          <Link to="/departments" className="btn btn-ghost btn-sm">
            View departments
          </Link>
        </div>
        <div className="panel-body">
          {departments.length === 0 ? (
            <p className="cell-muted">No departments yet.</p>
          ) : (
            departments.map((dept) => (
              <div className="bar-row" key={dept.id}>
                <div className="bar-label">{dept.name}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(dept.employeeCount / maxHeadcount) * 100}%` }}
                  />
                </div>
                <div className="bar-value tabular">{dept.employeeCount}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
