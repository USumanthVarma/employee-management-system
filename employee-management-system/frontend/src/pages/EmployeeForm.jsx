import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEmployee, getEmployee, updateEmployee } from '../api/employeeApi';
import { getDepartments } from '../api/departmentApi';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  designation: '',
  salary: '',
  dateOfJoining: '',
  departmentId: '',
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => setFormError('Could not load departments.'));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getEmployee(id)
      .then((employee) =>
        setForm({
          firstName: employee.firstName || '',
          lastName: employee.lastName || '',
          email: employee.email || '',
          phone: employee.phone || '',
          designation: employee.designation || '',
          salary: employee.salary ?? '',
          dateOfJoining: employee.dateOfJoining || '',
          departmentId: employee.departmentId ?? '',
        })
      )
      .catch(() => setFormError('Could not load that employee.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => ({
    ...form,
    salary: form.salary === '' ? null : Number(form.salary),
    departmentId: form.departmentId === '' ? null : Number(form.departmentId),
    dateOfJoining: form.dateOfJoining || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setErrors({});
    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await updateEmployee(id, payload);
      } else {
        await createEmployee(payload);
      }
      navigate('/employees');
    } catch (err) {
      const data = err.response?.data;
      if (data?.validationErrors) {
        setErrors(data.validationErrors);
      }
      setFormError(data?.message || 'Could not save this employee.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="loading-text">Loading…</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit employee' : 'Add employee'}</h1>
          <p>{isEdit ? 'Update this record.' : 'Add a new record to the register.'}</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-body">
          {formError && <div className="alert alert-error">{formError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'has-error' : ''}
                  required
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'has-error' : ''}
                  required
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? 'has-error' : ''}
                  required
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'has-error' : ''}
                  placeholder="9876500000"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="field">
                <label htmlFor="designation">Designation</label>
                <input id="designation" name="designation" value={form.designation} onChange={handleChange} />
              </div>

              <div className="field">
                <label htmlFor="salary">Salary (₹ / year)</label>
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.salary}
                  onChange={handleChange}
                  className={errors.salary ? 'has-error' : ''}
                />
                {errors.salary && <span className="error-text">{errors.salary}</span>}
              </div>

              <div className="field">
                <label htmlFor="dateOfJoining">Date of joining</label>
                <input
                  id="dateOfJoining"
                  name="dateOfJoining"
                  type="date"
                  value={form.dateOfJoining}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label htmlFor="departmentId">Department</label>
                <select
                  id="departmentId"
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  className={errors.departmentId ? 'has-error' : ''}
                  required
                >
                  <option value="" disabled>
                    Select a department
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && <span className="error-text">{errors.departmentId}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/employees')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
