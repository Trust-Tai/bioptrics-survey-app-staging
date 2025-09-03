import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface IndicatorDetailsModalProps {
  show: boolean;
  onHide: () => void;
  indicator: string | null;
  description?: string;
  relevance?: string;
}

// Centralized styles
const styles = {
  headerWrap: { borderBottom: 'none' },
  modalHeader: { borderBottom: 'none' },
  body: { padding: '2rem 2.5rem' },
  title: { marginBottom: '1.5rem' },
  section: { marginBottom: 24 },
  sectionTitle: { fontWeight: 600, color: '#6c47b6', marginBottom: 8 },
  sectionText: { fontSize: 16, color: '#222' },
  footerWrap: { borderTop: 'none' },
  modalFooter: { borderTop: 'none', paddingRight: '2.5rem', paddingBottom: '2rem' },
  buttonMin: { minWidth: 90 },
};

const IndicatorDetailsModal: React.FC<IndicatorDetailsModalProps> = ({ show, onHide, indicator, description, relevance }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <div style={styles.headerWrap}>
        <Modal.Header closeButton style={styles.modalHeader} />
      </div>
      <Modal.Body style={styles.body}>
        <h4 style={styles.title}>{indicator}</h4>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Indicator Description</div>
          <div style={styles.sectionText}>{description || 'No description available.'}</div>
        </div>
        <div>
          <div style={styles.sectionTitle}>Indicator Relevance</div>
          <div style={styles.sectionText}>{relevance || 'No relevance information available.'}</div>
        </div>
      </Modal.Body>
      <div style={styles.footerWrap}>
        <Modal.Footer className="justify-content-end" style={styles.modalFooter}>
          <Button variant="secondary" onClick={onHide} style={styles.buttonMin}>
            Close
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default IndicatorDetailsModal;
