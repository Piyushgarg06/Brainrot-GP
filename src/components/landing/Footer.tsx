'use client';

export function Footer() {
  return (
    <footer
      style={{
        width: '100%',
        backgroundColor: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--muted)',
          letterSpacing: '0.04em',
        }}
      >
        <span>
          © {new Date().getFullYear()} BRAINROTGP. ALL RIGHTS INSHEDENTALLY RESERVED.
        </span>
        <span>
          DESIGNED BY{' '}
          <a
            href="https://github.com/piyushgarg-dev"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text)',
              textDecoration: 'none',
              transition: 'border-bottom 0.15s ease',
              borderBottom: '1px solid transparent',
              paddingBottom: '2px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderBottomColor = 'var(--text)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            PIYUSH GARG
          </a>
          {' · '}
          SHIPPED BY{' '}
          <span
            style={{
              color: 'var(--text)',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text)';
            }}
          >
            ANTIGRAVITY
          </span>
        </span>
      </div>
    </footer>
  );
}
