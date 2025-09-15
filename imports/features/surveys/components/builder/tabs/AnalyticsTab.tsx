import React from 'react';
import { FiX, FiMessageSquare, FiUser, FiBarChart2 } from 'react-icons/fi';
import { FaUsers, FaPercentage, FaChartPie, FaClock } from 'react-icons/fa';

interface AnalyticsTabProps {
  surveyId?: string;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ surveyId }) => {
  return (
    <div className="survey-builder-panel">
      <div className="survey-builder-panel-header">
        <h2 className="survey-builder-panel-title">Analytics Dashboard</h2>
      </div>
      
      {surveyId ? (
        <div className="analytics-dashboard">
          {/* Filter Section */}
          <div className="analytics-filter-section">
            <div className="filter-header">
              <h3>Filter Data</h3>
              <button className="reset-filters-btn">
                <FiX size={14} /> Reset Filters
              </button>
            </div>
            <div className="filter-controls">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Date Range</label>
                  <div className="date-range-picker">
                    <input type="text" placeholder="dd-mm-yyyy" className="date-input" />
                    <span className="to-label">to</span>
                    <input type="text" placeholder="dd-mm-yyyy" className="date-input" />
                  </div>
                </div>
                <div className="filter-group">
                  <label>Question Tags</label>
                  <div className="custom-select">
                    <select className="filter-select">
                      <option value="">All Tags</option>
                      <option value="engagement">Engagement</option>
                      <option value="satisfaction">Satisfaction</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>
                <div className="filter-group">
                  <label>Response Status</label>
                  <div className="custom-select">
                    <select className="filter-select">
                      <option value="">All Responses</option>
                      <option value="completed">Completed</option>
                      <option value="incomplete">Incomplete</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* KPI Cards Section */}
          <div className="analytics-kpi-section">
            <div className="kpi-card">
              <div className="kpi-icon">
                <FaUsers size={24} />
              </div>
              <div className="kpi-content">
                <h4>Total Participants</h4>
                <div className="kpi-value">247</div>
                <div className="kpi-trend positive">+12% <span>vs prev. period</span></div>
              </div>
            </div>
            
            <div className="kpi-card">
              <div className="kpi-icon">
                <FaPercentage size={24} />
              </div>
              <div className="kpi-content">
                <h4>Response Rate</h4>
                <div className="kpi-value">68%</div>
                <div className="kpi-trend positive">+5% <span>vs prev. period</span></div>
              </div>
            </div>
            
            <div className="kpi-card">
              <div className="kpi-icon">
                <FaChartPie size={24} />
              </div>
              <div className="kpi-content">
                <h4>Engagement Score</h4>
                <div className="kpi-value">7.8</div>
                <div className="kpi-trend negative">-0.3 <span>vs prev. period</span></div>
              </div>
            </div>
            
            <div className="kpi-card">
              <div className="kpi-icon">
                <FaClock size={24} />
              </div>
              <div className="kpi-content">
                <h4>Avg. Completion Time</h4>
                <div className="kpi-value">4:32</div>
                <div className="kpi-trend neutral">0% <span>vs prev. period</span></div>
              </div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="analytics-charts-section">
            <div className="chart-container large">
              <div className="chart-header">
                <h3>Response Trends</h3>
              </div>
              <div className="chart-placeholder">
                {/* Modern line chart */}
                <div className="modern-line-chart">
                  <div className="chart-y-axis">
                    <div className="y-axis-label" style={{ position: 'absolute', top: '0' }}>5.0</div>
                    <div className="y-axis-label" style={{ position: 'absolute', top: '20%' }}>4.0</div>
                    <div className="y-axis-label" style={{ position: 'absolute', top: '40%' }}>3.0</div>
                    <div className="y-axis-label" style={{ position: 'absolute', top: '60%' }}>2.0</div>
                    <div className="y-axis-label" style={{ position: 'absolute', top: '80%' }}>1.0</div>
                    <div className="y-axis-label" style={{ position: 'absolute', top: '100%', transform: 'translateY(-100%)' }}>0.0</div>
                  </div>
                  <div className="chart-content">
                    <svg className="line-chart-svg" viewBox="0 0 600 200" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="0" x2="600" y2="0" className="grid-line" />
                      <line x1="0" y1="40" x2="600" y2="40" className="grid-line" />
                      <line x1="0" y1="80" x2="600" y2="80" className="grid-line" />
                      <line x1="0" y1="120" x2="600" y2="120" className="grid-line" />
                      <line x1="0" y1="160" x2="600" y2="160" className="grid-line" />
                      <line x1="0" y1="200" x2="600" y2="200" className="grid-line" />
                      
                      {/* Line chart path */}
                      <path 
                        d="M0,200 C20,80 50,10 100,10 S150,80 200,120 S250,160 300,80 S350,10 400,10 S450,80 500,160 S550,180 600,140" 
                        className="line-path" 
                      />
                      
                      {/* Data points */}
                      <circle cx="0" cy="200" r="4" className="data-point" />
                      <circle cx="100" cy="10" r="4" className="data-point" />
                      <circle cx="200" cy="120" r="4" className="data-point" />
                      <circle cx="300" cy="80" r="4" className="data-point" />
                      <circle cx="400" cy="10" r="4" className="data-point" />
                      <circle cx="500" cy="160" r="4" className="data-point" />
                      <circle cx="600" cy="140" r="4" className="data-point" />
                    </svg>
                    
                    <div className="chart-x-axis">
                      <div className="x-axis-label">Aug 21</div>
                      <div className="x-axis-label">Aug 22</div>
                      <div className="x-axis-label">Aug 23</div>
                      <div className="x-axis-label">Aug 24</div>
                      <div className="x-axis-label">Aug 25</div>
                      <div className="x-axis-label">Aug 26</div>
                      <div className="x-axis-label">Aug 27</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="chart-container">
              <div className="chart-header">
                <h3>Question Response Distribution</h3>
              </div>
              <div className="chart-placeholder">
                {/* Enhanced SVG Donut Chart */}
                <div className="donut-chart-container">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {/* Donut segments - 78% answered, 22% skipped */}
                    <circle cx="100" cy="100" r="80" fill="transparent" stroke="#552a47" strokeWidth="30" strokeDasharray="392 503" strokeDashoffset="0" />
                    <circle cx="100" cy="100" r="80" fill="transparent" stroke="#c9b7c7" strokeWidth="30" strokeDasharray="111 503" strokeDashoffset="-392" />
                    
                    {/* Center circle */}
                    <circle cx="100" cy="100" r="50" fill="white" />
                    
                    {/* Center text */}
                    <text x="100" y="90" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#334155">30</text>
                    <text x="100" y="110" textAnchor="middle" fontSize="14" fill="#334155">Questions</text>
                    <text x="100" y="125" textAnchor="middle" fontSize="14" fill="#334155">Total</text>
                  </svg>
                  
                  {/* Legend with total counts */}
                  <div className="donut-chart-legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#552a47'}}></div>
                      <div className="legend-text">Answered (78%)</div>
                      <div className="legend-count">23 questions</div>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#c9b7c7'}}></div>
                      <div className="legend-text">Skipped (22%)</div>
                      <div className="legend-count">7 questions</div>
                    </div>
                    <div className="legend-item legend-total">
                      <div className="legend-text">From 5 survey submissions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="chart-container">
              <div className="chart-header">
                <h3>Engagement by Question</h3>
              </div>
              <div className="chart-placeholder">
                {/* Bar chart placeholder */}
                <div className="mock-bar-chart">
                  <div className="mock-bar" style={{height: '75%'}}></div>
                  <div className="mock-bar" style={{height: '90%'}}></div>
                  <div className="mock-bar" style={{height: '60%'}}></div>
                  <div className="mock-bar" style={{height: '85%'}}></div>
                  <div className="mock-bar" style={{height: '40%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Section */}
          <div className="analytics-activity-section">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <FiMessageSquare size={16} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">New Response Submitted</div>
                  <div className="activity-meta">John D. • 2 hours ago</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <FiUser size={16} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Participant Started Survey</div>
                  <div className="activity-meta">Sarah M. • 3 hours ago</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <FiBarChart2 size={16} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Weekly Report Generated</div>
                  <div className="activity-meta">System • 1 day ago</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">
                  <FiMessageSquare size={16} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">New Response Submitted</div>
                  <div className="activity-meta">Alex T. • 1 day ago</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Add CSS for the Analytics tab */}
          <style jsx>{`
            .analytics-dashboard {
              display: flex;
              flex-direction: column;
              gap: 24px;
              padding: 0 0 24px 0;
            }
            
            .analytics-filter-section {
              background-color: white;
              border-radius: 8px;
              padding: 20px;
              border: 1px solid #e2e8f0;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
              margin-bottom: 16px;
            }
            
            .filter-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            }
            
            .filter-header h3 {
              margin: 0;
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
            }
            
            .reset-filters-btn {
              display: flex;
              align-items: center;
              gap: 6px;
              background: none;
              border: none;
              border-radius: 4px;
              padding: 8px 12px;
              font-size: 14px;
              color: #64748b;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .reset-filters-btn:hover {
              background-color: #f1f5f9;
              color: #334155;
            }
            
            .filter-controls {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }
            
            .filter-row {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              width: 100%;
            }
            
            .filter-group {
              display: flex;
              flex-direction: column;
              gap: 8px;
              flex: 1;
              min-width: 200px;
            }
            
            .filter-group label {
              font-size: 14px;
              font-weight: 500;
              color: #64748b;
            }
            
            .date-range-picker {
              display: flex;
              align-items: center;
              gap: 10px;
              width: 100%;
            }
            
            .to-label {
              color: #94a3b8;
              font-size: 14px;
              white-space: nowrap;
            }
            
            .date-input, .filter-select {
              padding: 10px 14px;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              font-size: 14px;
              color: #334155;
              background-color: white;
              width: 100%;
              transition: border-color 0.2s;
            }
            
            .date-input:focus, .filter-select:focus {
              outline: none;
              border-color: #552a47;
              box-shadow: 0 0 0 2px rgba(85, 42, 71, 0.1);
            }
            
            .date-input {
              flex: 1;
            }
            
            .custom-select {
              position: relative;
              width: 100%;
            }
            
            .custom-select::after {
              content: '';
              position: absolute;
              right: 14px;
              top: 50%;
              transform: translateY(-50%);
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 5px solid #64748b;
              pointer-events: none;
            }
            
             .filter-select {
                          appearance: none;
                          padding-right: 30px;
                        }
                        
                        .analytics-kpi-section {
                          display: grid;
                          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                          gap: 16px;
                        }
                        
                        .kpi-card {
                          background-color: white;
                          border-radius: 8px;
                          padding: 20px;
                          display: flex;
                          align-items: flex-start;
                          gap: 16px;
                          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                          border: 1px solid #e2e8f0;
                          transition: all 0.2s;
                        }
                        
                        .kpi-card:hover {
                          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                          transform: translateY(-2px);
                        }
                        
                        .kpi-icon {
                          background-color: #f8fafc;
                          border-radius: 12px;
                          width: 48px;
                          height: 48px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: #552a47;
                        }
                        
                        .kpi-content {
                          flex: 1;
                        }
                        
                        .kpi-content h4 {
                          margin: 0 0 8px 0;
                          font-size: 14px;
                          font-weight: 500;
                          color: #64748b;
                        }
                        
                        .kpi-value {
                          font-size: 24px;
                          font-weight: 700;
                          color: #1e293b;
                          margin-bottom: 4px;
                        }
                        
                        .kpi-trend {
                          font-size: 13px;
                          font-weight: 500;
                        }
                        
                        .kpi-trend.positive {
                          color: #10b981;
                        }
                        
                        .kpi-trend.negative {
                          color: #ef4444;
                        }
                        
                        .kpi-trend.neutral {
                          color: #94a3b8;
                        }
                        
                        .kpi-trend span {
                          font-weight: 400;
                          color: #94a3b8;
                          margin-left: 4px;
                        }
                        
                        .analytics-charts-section {
                          display: grid;
                          grid-template-columns: repeat(2, 1fr);
                          gap: 16px;
                        }
                        
                        .chart-container {
                          background-color: white;
                          border-radius: 8px;
                          padding: 16px;
                          border: 1px solid #e2e8f0;
                          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                          height: 380px;
                          display: flex;
                          flex-direction: column;
                        }
                        
                        .chart-container.large {
                          grid-column: span 2;
                        }
                        
                        .chart-header {
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          margin-bottom: 16px;
                        }
                        
                        .chart-header h3 {
                          margin: 0;
                          font-size: 16px;
                          font-weight: 600;
                          color: #1e293b;
                        }
                        
                        .chart-legend {
                          display: flex;
                          gap: 16px;
                        }
                        
                        .legend-item {
                          display: flex;
                          align-items: center;
                          gap: 6px;
                          font-size: 13px;
                          color: #64748b;
                        }
                        
                        .legend-color {
                          width: 12px;
                          height: 12px;
                          border-radius: 2px;
                        }
                        
                        .chart-placeholder {
                          flex: 1;
                          background-color: #f8fafc;
                          border-radius: 4px;
                          position: relative;
                          overflow: hidden;
                          margin-bottom: 10px;
                        }
                        
                        /* Mock chart styles */
                        .modern-line-chart {
                          width: 100%;
                          height: 100%;
                          display: flex;
                          padding: 10px 20px 40px 20px;
                        }
                        
                        .chart-y-axis {
                          display: flex;
                          flex-direction: column;
                          justify-content: space-between;
                          padding-right: 15px;
                          width: 40px;
                          height: 180px;
                          position: relative;
                        }
                        
                        .y-axis-label {
                          font-size: 12px;
                          color: #94a3b8;
                          text-align: right;
                          line-height: 1;
                          transform: translateY(-50%);
                        }
                        
                        .chart-content {
                          flex: 1;
                          position: relative;
                          height: 100%;
                        }
                        
                        .line-chart-svg {
                          width: 100%;
                          height: 180px;
                          overflow: visible;
                        }
                        
                        .grid-line {
                          stroke: #e2e8f0;
                          stroke-width: 1;
                        }
                        
                        .line-path {
                          fill: none;
                          stroke: #3b82f6;
                          stroke-width: 3;
                          stroke-linecap: round;
                          stroke-linejoin: round;
                        }
                        
                        .data-point {
                          fill: white;
                          stroke: #3b82f6;
                          stroke-width: 2;
                        }
                        
                        .chart-x-axis {
                          display: flex;
                          justify-content: space-between;
                          margin-top: 5px;
                          padding-bottom: 5px;
                          width: 100%;
                        }
                        
                        .x-axis-label {
                          font-size: 12px;
                          color: #94a3b8;
                          text-align: center;
                          flex: 1;
                        }
                        
                        .time-range-select {
                          padding: 6px 12px;
                          border: 1px solid #e2e8f0;
                          border-radius: 6px;
                          font-size: 14px;
                          color: #334155;
                          background-color: white;
                          appearance: none;
                          padding-right: 30px;
                          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                          background-repeat: no-repeat;
                          background-position: right 8px center;
                          background-size: 16px;
                        }
                        
                        .chart-controls {
                          display: flex;
                          align-items: center;
                        }
                        
                        .donut-chart-container {
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          padding: 10px;
                        }
                        
                        .donut-chart-legend {
                          display: flex;
                          flex-direction: column;
                          gap: 8px;
                          margin-top: 15px;
                          width: 100%;
                          max-width: 200px;
                        }
                        
                        .legend-item {
                          display: flex;
                          align-items: center;
                          gap: 8px;
                        }
                        
                        .legend-color {
                          width: 12px;
                          height: 12px;
                          border-radius: 3px;
                        }
                        
                        .legend-text {
                          font-size: 14px;
                          color: #334155;
                          font-weight: 500;
                        }
                        
                        .legend-count {
                          font-size: 12px;
                          color: #64748b;
                          margin-left: 20px;
                        }
                        
                        .legend-total {
                          margin-top: 10px;
                          padding-top: 8px;
                          border-top: 1px solid #e2e8f0;
                        }
                        
                        /* Keep the old styles for backward compatibility */
                        .mock-donut-chart {
                          width: 160px;
                          height: 160px;
                          border-radius: 50%;
                          position: relative;
                          overflow: hidden;
                          display: none; /* Hide the old chart */
                        }
                        
                        .mock-donut-segment {
                          position: absolute;
                          width: 100%;
                          height: 100%;
                          clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%);
                          opacity: 0.8;
                        }
                        
                        .mock-donut-hole {
                          position: absolute;
                          width: 60%;
                          height: 60%;
                          background-color: white;
                          border-radius: 50%;
                          top: 20%;
                          left: 20%;
                        }
                        
                        .mock-bar-chart {
                          width: 100%;
                          height: 100%;
                          display: flex;
                          align-items: flex-end;
                          justify-content: space-around;
                          padding: 20px;
                        }
                        
                        .mock-bar {
                          width: 30px;
                          background-color: #552a47;
                          border-radius: 4px 4px 0 0;
                          opacity: 0.8;
                        }
                        
                        .analytics-activity-section {
                          background-color: white;
                          border-radius: 8px;
                          padding: 20px;
                          border: 1px solid #e2e8f0;
                          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                        }
                        
                        .analytics-activity-section h3 {
                          margin: 0 0 16px 0;
                          font-size: 16px;
                          font-weight: 600;
                          color: #1e293b;
                        }
                        
                        .activity-list {
                          display: flex;
                          flex-direction: column;
                          gap: 12px;
                        }
                        
                        .activity-item {
                          display: flex;
                          align-items: center;
                          gap: 12px;
                          padding: 12px;
                          border-radius: 6px;
                          transition: background-color 0.2s;
                        }
                        
                        .activity-item:hover {
                          background-color: #f8fafc;
                        }
                        
                        .activity-icon {
                          width: 32px;
                          height: 32px;
                          border-radius: 50%;
                          background-color: #f1f5f9;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: #552a47;
                        }
                        
                        .activity-content {
                          flex: 1;
                        }
                        
                        .activity-title {
                          font-size: 14px;
                          font-weight: 500;
                          color: #334155;
                          margin-bottom: 2px;
                        }
                        
                        .activity-meta {
                          font-size: 13px;
                          color: #94a3b8;
                        }
                        
                        @media (max-width: 768px) {
                          .analytics-kpi-section,
                          .analytics-charts-section {
                            grid-template-columns: 1fr;
                          }
                          
                          .chart-container.large {
                            grid-column: span 1;
                          }
                          }
  `}</style>
</div>
      ): (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>Please save the survey first to view analytics.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;



