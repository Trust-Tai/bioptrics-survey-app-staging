/**
 * Empty progress bar utility (NProgress implementation removed)
 * This file provides no-op methods to maintain API compatibility
 */

// Initialize with custom styles (no-op)
const initialize = () => {};

// Start the progress bar (no-op)
const start = () => {};

// Complete the progress bar (no-op)
const done = () => {};

// Set the progress to a specific percentage (no-op)
const set = (progress: number) => {};

// Increment the progress by a small random amount (no-op)
const inc = () => {};

// Export the empty utility
const progressBar = {
  initialize,
  start,
  done,
  set,
  inc
};

export default progressBar;
