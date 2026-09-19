import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty-state" style={{ paddingTop: 'var(--space-5)' }}>
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }}>
        Back to dashboard
      </Link>
    </div>
  );
}
