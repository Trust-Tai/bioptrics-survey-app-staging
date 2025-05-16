import React from 'react';
import AdminLayout from './AdminLayout';

const Analytics: React.FC = () => {
  // Placeholder stats and structure
  return (
    <AdminLayout>
      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: 32, gap: 32 }}>
        {/* Filters Sidebar */}
        <aside style={{ minWidth: 220, background: '#faf8fa', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px #eee' }}>
          <h3 style={{ fontWeight: 700, color: '#552a47', fontSize: 18, marginBottom: 16 }}>Filters</h3>
          <div style={{ marginBottom: 12 }}>
            <label>Site:</label>
            <select style={{ width: '100%', marginTop: 4 }}><option>All Sites</option></select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Department:</label>
            <select style={{ width: '100%', marginTop: 4 }}><option>All Departments</option></select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Role Level:</label>
            <select style={{ width: '100%', marginTop: 4 }}><option>All Levels</option></select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Tenure:</label>
            <select style={{ width: '100%', marginTop: 4 }}><option>All Tenure</option></select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Demographics:</label>
            <select style={{ width: '100%', marginTop: 4 }}><option>All Demographics</option></select>
          </div>
          <button style={{ width: '100%', background: '#552a47', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 600, marginTop: 10 }}>Apply Filters</button>
        </aside>
        {/* Main Analytics Content */}
        <main style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 700, color: '#552a47', fontSize: 28, marginBottom: 24 }}>Analytics Dashboard</h2>

          {/* Participation Overview */}
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, color: '#552a47', fontSize: 20 }}>Participation Overview</h3>
            <div style={{ display: 'flex', gap: 32, marginTop: 14 }}>
              <div style={{ background: '#f7f2f5', borderRadius: 10, padding: 24, minWidth: 180, textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#552a47' }}>1,234</div>
                <div style={{ color: '#8a6d8a', fontWeight: 500 }}>Surveys Completed</div>
              </div>
              <div style={{ background: '#f7f2f5', borderRadius: 10, padding: 24, minWidth: 180, textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#552a47' }}>82%</div>
                <div style={{ color: '#8a6d8a', fontWeight: 500 }}>Participation Rate</div>
              </div>
            </div>
          </section>

          {/* WPS Zone/Theme Breakdown */}
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, color: '#552a47', fontSize: 20 }}>WPS Zone / Theme Breakdown</h3>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ background: '#e0e7ef', borderRadius: 10, padding: 20, minWidth: 160, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#552a47' }}>Safety</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>4.2</div>
                <div style={{ color: '#8a6d8a' }}>Avg. Score</div>
              </div>
              <div style={{ background: '#e0e7ef', borderRadius: 10, padding: 20, minWidth: 160, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#552a47' }}>Engagement</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>3.8</div>
                <div style={{ color: '#8a6d8a' }}>Avg. Score</div>
              </div>
              <div style={{ background: '#e0e7ef', borderRadius: 10, padding: 20, minWidth: 160, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#552a47' }}>Leadership</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>4.0</div>
                <div style={{ color: '#8a6d8a' }}>Avg. Score</div>
              </div>
              {/* Add more themes as needed */}
            </div>
          </section>

          {/* Heatmap Placeholder */}
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, color: '#552a47', fontSize: 20 }}>Heatmap (Sample)</h3>
            <div style={{ background: '#f7f2f5', borderRadius: 10, padding: 24, textAlign: 'center', color: '#aaa' }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Heatmap Visualization Coming Soon</div>
              <div style={{ marginTop: 12 }}>[Sample: Site x Theme color grid]</div>
            </div>
          </section>

          {/* Trendlines Placeholder */}
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, color: '#552a47', fontSize: 20 }}>Trendlines</h3>
            <div style={{ background: '#f7f2f5', borderRadius: 10, padding: 24, textAlign: 'center', color: '#aaa' }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Trendline Visualization Coming Soon</div>
              <div style={{ marginTop: 12 }}>[Sample: Line chart of scores by wave]</div>
            </div>
          </section>

          {/* Open-text Insights Placeholder */}
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, color: '#552a47', fontSize: 20 }}>Open-text Insights</h3>
            <div style={{ background: '#f7f2f5', borderRadius: 10, padding: 24, textAlign: 'center', color: '#aaa' }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>NLP Topic Modeling Coming Soon</div>
              <div style={{ marginTop: 12 }}>[Sample: Top 3 topics, word cloud]</div>
            </div>
          </section>

          {/* Export Options */}
          <section style={{ marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, color: '#552a47', fontSize: 20 }}>Export Options</h3>
            <div style={{ display: 'flex', gap: 16 }}>
              <button style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600 }}>Export CSV</button>
              <button style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600 }}>Export PDF</button>
              <button style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600 }}>Power BI</button>
            </div>
          </section>
        </main>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
