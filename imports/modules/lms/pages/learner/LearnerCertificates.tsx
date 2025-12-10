import React from 'react';
import styled from 'styled-components';
import { Award, Clock, Calendar, ExternalLink, Download } from 'lucide-react';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// Header Section
const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

// Stats Section
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatIcon = styled.div<{ bgColor: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const StatContent = styled.div``;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
`;

// Certificate Section
const SectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
`;

// Certificate Card
const CertificateCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 12px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CertIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
    color: #f97316;
  }
`;

const CertInfo = styled.div`
  flex: 1;
`;

const CertTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const CertInstructor = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
  
  span {
    color: #3b82f6;
  }
`;

const CertMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const CertBadge = styled.span`
  padding: 6px 12px;
  background: #ecfdf5;
  color: #059669;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

const CertActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 12px;
  }
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f97316;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #ea580c;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Upcoming Certificate
const UpcomingCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const UpcomingIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
    color: #9ca3af;
  }
`;

const UpcomingInfo = styled.div`
  flex: 1;
`;

const UpcomingTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const UpcomingMeta = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const UpcomingProgress = styled.div`
  text-align: right;
`;

const ProgressValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #06b6d4;
`;

const ProgressLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

// Sample data
const earnedCertificates = [
  {
    id: '1',
    title: 'Introduction to Python Programming',
    instructor: 'Dr. Sarah Chen',
    date: 'November 15, 2024',
    duration: '8 hours',
    certId: 'CERT-PY-2024-001',
  },
  {
    id: '2',
    title: 'Data Analysis Fundamentals',
    instructor: 'Prof. Michael Torres',
    date: 'October 28, 2024',
    duration: '12 hours',
    certId: 'CERT-DA-2024-042',
  },
];

const upcomingCertificates = [
  {
    id: '1',
    title: "Neuroplasticity: Unlock Your Brain's Potential",
    estCompletion: 'December 20, 2024',
    progress: 40,
  },
];

export const LearnerCertificates: React.FC = () => {
  const handleView = (certId: string) => {
    console.log('View certificate:', certId);
    // Open certificate in new tab
  };

  const handleDownload = (certId: string) => {
    console.log('Download certificate:', certId);
    // Download certificate PDF
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader>
        <PageTitle>Certificates</PageTitle>
        <PageSubtitle>View and download your earned certificates</PageSubtitle>
      </PageHeader>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon bgColor="#f97316">
            <Award />
          </StatIcon>
          <StatContent>
            <StatValue>2</StatValue>
            <StatLabel>Earned Certificates</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon bgColor="#06b6d4">
            <Clock />
          </StatIcon>
          <StatContent>
            <StatValue>2</StatValue>
            <StatLabel>In Progress</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon bgColor="#22c55e">
            <Calendar />
          </StatIcon>
          <StatContent>
            <StatValue>20h</StatValue>
            <StatLabel>Total Learning Time</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Earned Certificates */}
      <SectionCard>
        <SectionTitle>Earned Certificates</SectionTitle>
        
        {earnedCertificates.map((cert) => (
          <CertificateCard key={cert.id}>
            <CertIcon>
              <Award />
            </CertIcon>
            <CertInfo>
              <CertTitle>{cert.title}</CertTitle>
              <CertInstructor>
                Instructor: <span>{cert.instructor}</span>
              </CertInstructor>
              <CertMeta>
                <span>
                  <Calendar /> {cert.date}
                </span>
                <span>
                  <Clock /> {cert.duration}
                </span>
              </CertMeta>
            </CertInfo>
            <CertBadge>{cert.certId}</CertBadge>
            <CertActions>
              <ViewButton onClick={() => handleView(cert.id)}>
                <ExternalLink /> View
              </ViewButton>
              <DownloadButton onClick={() => handleDownload(cert.id)}>
                <Download /> Download
              </DownloadButton>
            </CertActions>
          </CertificateCard>
        ))}
      </SectionCard>

      {/* Upcoming Certificates */}
      <SectionCard>
        <SectionTitle>Upcoming Certificates</SectionTitle>
        
        {upcomingCertificates.map((cert) => (
          <UpcomingCard key={cert.id}>
            <UpcomingIcon>
              <Award />
            </UpcomingIcon>
            <UpcomingInfo>
              <UpcomingTitle>{cert.title}</UpcomingTitle>
              <UpcomingMeta>Est. completion: {cert.estCompletion}</UpcomingMeta>
            </UpcomingInfo>
            <UpcomingProgress>
              <ProgressValue>{cert.progress}%</ProgressValue>
              <ProgressLabel>complete</ProgressLabel>
            </UpcomingProgress>
          </UpcomingCard>
        ))}
      </SectionCard>
    </PageContainer>
  );
};
