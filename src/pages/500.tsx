import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Custom500() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after 3 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

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
          500
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginTop: '1rem' }}>
          Server error occurred.
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