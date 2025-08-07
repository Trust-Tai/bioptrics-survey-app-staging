import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  minimum: 0.1,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  parent: 'body'
});

// Custom CSS for NProgress to be added to the document
const nprogressCustomStyles = `
  #nprogress .bar {
    background: #552a47;
    height: 3px;
  }
  
  #nprogress .peg {
    box-shadow: 0 0 10px #552a47, 0 0 5px #552a47;
  }
`;

// Add custom styles to the document
const addCustomStyles = () => {
  const styleElement = document.createElement('style');
  styleElement.textContent = nprogressCustomStyles;
  document.head.appendChild(styleElement);
};

// Initialize NProgress with custom styles
const initialize = () => {
  addCustomStyles();
};

// Start the progress bar
const start = () => {
  NProgress.start();
};

// Complete the progress bar
const done = () => {
  NProgress.done();
};

// Set the progress to a specific percentage (0-1)
const set = (progress: number) => {
  NProgress.set(progress);
};

// Increment the progress by a small random amount
const inc = () => {
  NProgress.inc();
};

// Export the NProgress utility
const progressBar = {
  initialize,
  start,
  done,
  set,
  inc
};

export default progressBar;
