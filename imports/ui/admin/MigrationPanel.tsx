import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { FiDatabase, FiRefreshCw, FiTrash2, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const MigrationContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const MigrationCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatusCard = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const StatusValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 0.5rem;
`;

const StatusLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  background: ${props => {
    switch (props.variant) {
      case 'danger': return '#dc2626';
      case 'secondary': return '#6b7280';
      default: return '#2563eb';
    }
  }};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LogContainer = styled.div`
  background: #1f2937;
  color: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

const WarningBox = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const InfoBox = styled.div`
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

interface MigrationStatus {
  totalSurveys: number;
  legacySurveys: number;
  modernSurveys: number;
  migratedSurveys: number;
  needsMigration: number;
}

const MigrationPanel: React.FC = () => {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState('');

  const loadStatus = async () => {
    try {
      const result = await new Promise<MigrationStatus>((resolve, reject) => {
        Meteor.call('surveys.getMigrationStatus', (error: any, result: MigrationStatus) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      setStatus(result);
    } catch (error) {
      console.error('Error loading migration status:', error);
      addLog(`Error loading status: ${error}`);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog(prev => prev + `[${timestamp}] ${message}\n`);
  };

  const runMigration = async () => {
    setLoading(true);
    addLog('Starting migration...');
    
    try {
      const result = await new Promise<{migratedCount: number, errorCount: number}>((resolve, reject) => {
        Meteor.call('surveys.migrateQuestions', (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      
      addLog(`Migration completed: ${result.migratedCount} surveys migrated, ${result.errorCount} errors`);
      await loadStatus();
    } catch (error) {
      addLog(`Migration failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    setLoading(true);
    addLog('Starting cleanup of legacy selectedQuestions...');
    
    try {
      const result = await new Promise<number>((resolve, reject) => {
        Meteor.call('surveys.cleanupLegacyQuestions', (error: any, result: number) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      
      addLog(`Cleanup completed: ${result} surveys cleaned`);
      await loadStatus();
    } catch (error) {
      addLog(`Cleanup failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <MigrationContainer>
      <MigrationCard>
        <Title>
          <FiDatabase />
          Survey Questions Migration
        </Title>
        
        <InfoBox>
          <FiInfo />
          <div>
            <strong>Purpose:</strong> This tool consolidates the dual question storage system 
            (selectedQuestions + sectionQuestions) into a single unified format (sectionQuestions only). 
            This eliminates conflicts and simplifies the codebase.
          </div>
        </InfoBox>

        {status && (
          <StatusGrid>
            <StatusCard>
              <StatusValue>{status.totalSurveys}</StatusValue>
              <StatusLabel>Total Surveys</StatusLabel>
            </StatusCard>
            <StatusCard>
              <StatusValue>{status.legacySurveys}</StatusValue>
              <StatusLabel>Legacy Format</StatusLabel>
            </StatusCard>
            <StatusCard>
              <StatusValue>{status.modernSurveys}</StatusValue>
              <StatusLabel>Modern Format</StatusLabel>
            </StatusCard>
            <StatusCard>
              <StatusValue>{status.needsMigration}</StatusValue>
              <StatusLabel>Need Migration</StatusLabel>
            </StatusCard>
          </StatusGrid>
        )}

        {status && status.needsMigration > 0 && (
          <WarningBox>
            <FiAlertTriangle />
            <div>
              <strong>Action Required:</strong> {status.needsMigration} surveys are using the legacy 
              selectedQuestions format and need to be migrated to prevent conflicts.
            </div>
          </WarningBox>
        )}

        <div>
          <Button onClick={loadStatus} disabled={loading}>
            <FiRefreshCw />
            Refresh Status
          </Button>
          
          <Button 
            onClick={runMigration} 
            disabled={loading || (status?.needsMigration === 0)}
          >
            <FiDatabase />
            Migrate Questions
          </Button>
          
          <Button 
            variant="danger"
            onClick={runCleanup} 
            disabled={loading || (status?.migratedSurveys === 0)}
          >
            <FiTrash2 />
            Cleanup Legacy Data
          </Button>
        </div>

        {log && (
          <div>
            <h3>Migration Log</h3>
            <LogContainer>{log}</LogContainer>
          </div>
        )}
      </MigrationCard>
    </MigrationContainer>
  );
};

export default MigrationPanel;
