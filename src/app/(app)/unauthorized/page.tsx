// src/app/(app)/unauthorized/page.tsx
import React from 'react';
import Link from 'next/link';

const UnauthorizedPage = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Access Denied</h1>
      <p>You do not have the necessary permissions to access this page.</p>
      <Link href="/dashboard">Go to Dashboard</Link>
    </div>
  );
};

export default UnauthorizedPage;
