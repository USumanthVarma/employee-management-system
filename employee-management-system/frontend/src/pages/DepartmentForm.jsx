import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDepartment, getDepartment, updateDepartment } from '../api/departmentApi';

export default function DepartmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', location: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getDepartment(id)
      .then((dept) => setForm({ name: dept.name, location: dept.location || '' }))
      .catch(() => setFormError('Could not load that department.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setErrors({});
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateDepartment(id, form);
      } else {
        await createDepartment(form);
      }
      navigate('/departments');
    } catch (err) {
      const data = err.response?.data;
      if (data?.validationErrors) setErrors(data.validationErrors);
      setFormError(data?.message || 'Could not save this department.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="loading-text">Loading…</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit department' : 'Add department'}</h1>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 480 }}>
        <div className="panel-body">
          {formError && <div className="alert alert-error">{formError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? 'has-error' : ''}
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="field">
              <label htmlFor="location">Location</label>
              <input id="location" name="location" value={form.location} onChange={handleChange} />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/departments')}>
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
