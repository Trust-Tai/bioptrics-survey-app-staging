import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface WpsBuilderModalProps {
  show: boolean;
  onHide: () => void;
  onBegin?: () => void;
}

const slides = [
  {
    heading: 'Welcome to the WPS Builder',
    text: 'This builder will help automate the creation of a Whole Person Safety Survey that will provide you with the insights you are looking for. Whole Person Safety is the world most complete, researched, and in-depth model for evaluating and gaining insight into the Whole Person Safety at your workplace. '
  },
  {
    heading: 'WPS Overview',
    text: 'To give you a big picture overview of the Whole Person Safety Model, it is 6 Safety Zones, Broken into XX Standards, Broken into XX Indicators.'
  },
  {
    heading: 'Where to Start',
    text: 'We recommend 16 indicators as a best practice. Based your needs you can choose as many or as little as you’d like.'
  }
];

// Hoisted constants and helpers
const RESET_DELAY_MS = 500; // ms, matches Bootstrap modal fade duration
const DIALOG_CLASS = 'wps-builder-modal';

const styles = {
  headerWrap: { borderBottom: 'none' },
  modalHeader: { borderBottom: 'none' },
  body: { padding: '2rem 2.5rem' },
  title: { marginBottom: '1.5rem' },
  footerWrap: { borderTop: 'none' },
  modalFooter: { borderTop: 'none', paddingRight: '2.5rem', paddingBottom: '2rem' },
  buttonMin: { minWidth: 90 },
};

const getSlide = (i: number) => slides[i];
const isFirstSlide = (i: number) => i === 0;
const isLastSlide = (i: number) => i === slides.length - 1;

const WpsBuilderModal: React.FC<WpsBuilderModalProps> = ({ show, onHide, onBegin }) => {
  const [slide, setSlide] = useState(0);

  const handleNext = () => {
    if (!isLastSlide(slide)) {
      setSlide(slide + 1);
    } else {
      if (typeof onBegin === 'function') onBegin();
      onHide();
      setTimeout(() => setSlide(0), RESET_DELAY_MS);
    }
  };

  const handleBack = () => {
    if (!isFirstSlide(slide)) setSlide(slide - 1);
  };

  const handleClose = () => {
    onHide();
    setTimeout(() => setSlide(0), RESET_DELAY_MS);
  };

  const current = getSlide(slide);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" dialogClassName={DIALOG_CLASS}>
      <div style={styles.headerWrap}>
        <Modal.Header closeButton style={styles.modalHeader} />
      </div>
      <Modal.Body style={styles.body}>
        <h4 style={styles.title}>{current.heading}</h4>
        <p>{current.text}</p>
      </Modal.Body>
      <div style={styles.footerWrap}>
        <Modal.Footer className="justify-content-end" style={styles.modalFooter}>
          {!isFirstSlide(slide) && (
            <Button variant="secondary" onClick={handleBack} style={styles.buttonMin}>
              Back
            </Button>
          )}
          <Button variant="primary" onClick={handleNext} style={styles.buttonMin}>
            {isLastSlide(slide) ? 'Begin' : 'Next'}
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default WpsBuilderModal;
