import React from 'react';
import AdminLayout from './AdminLayout';

const Setting: React.FC = () => {
  return (
    <AdminLayout>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, marginTop: 40, textAlign: 'center' }}>
        <h2 style={{ color: '#b7a36a', marginBottom: 16 }}>Settings</h2>
        <p style={{ color: '#6e5a67', fontSize: 18 }}>
          No settings are available at this time. This page will be updated with configuration options soon.
        </p>
      </div>
    </AdminLayout>
  );
};

export default Setting;
