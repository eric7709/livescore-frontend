import { Suspense } from 'react';

export default function RecordStatsPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Suspense fallback={
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Initializing logger interface...
          </div>
        }>
          <div>Lineup builder is accessed from the route page.</div>
        </Suspense>
      </div>
    </main>
  );
}