import NextErrorComponent from 'next/error';

export default function CustomError({ statusCode }: { statusCode: number }) {
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
          {statusCode}
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginTop: '1rem' }}>
          {statusCode === 404 ? 'This page could not be found.' : 'An error occurred.'}
        </p>
        <a href="/" style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none'
        }}>
          Go back home
        </a>
      </div>
    </div>
  );
}

CustomError.getInitialProps = async ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
