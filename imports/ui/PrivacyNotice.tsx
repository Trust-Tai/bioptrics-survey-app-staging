import React from 'react';

const PrivacyNotice: React.FC = () => (
  <div style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
    <h1>Privacy Notice</h1>
    <p>This Privacy Notice is dummy content for demonstration purposes.</p>
    <ul>
      <li>We respect your privacy and are committed to protecting your data.</li>
      <li>Your data will not be sold or shared with third parties without your consent.</li>
      <li>We collect basic information to provide and improve our services.</li>
      <li>You can request deletion of your data at any time.</li>
    </ul>
    <p>Contact us if you have any questions about your privacy.</p>
  </div>
);

export default PrivacyNotice;
