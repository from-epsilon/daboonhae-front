import { Link } from 'react-router-dom';
import './Auth.css';

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M 32 8 A 24 24 0 1 0 56 32" fill="none" stroke="currentColor" strokeWidth="7.5" strokeLinecap="round" />
      <circle cx="49.5" cy="14.5" r="3.6" fill="currentColor" />
      <circle cx="41" cy="6.5" r="2.4" fill="currentColor" opacity="0.75" />
      <circle cx="57" cy="22" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export default function AuthShell({ title, description, children, compact = false }) {
  return (
    <main className="auth-page">
      <section className={`auth-card${compact ? ' auth-card--compact' : ''}`}>
        <Link to="/" className="auth-brand" aria-label="다분해 홈">
          <BrandMark />
          <span><b>다</b>분<b>해</b>.</span>
        </Link>
        <header className="auth-heading">
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </header>
        {children}
      </section>
    </main>
  );
}
