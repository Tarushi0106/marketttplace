import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          404
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginTop: '1rem' }}>
          This page could not be found.
        </p>
        <Link href="/" style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none'
        }}>
          Go back home
        </Link>
      </div>
    </div>
  );
}

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {},
  };
}
