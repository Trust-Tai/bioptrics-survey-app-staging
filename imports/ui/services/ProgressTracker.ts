import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';

// Define the progress stages and their weight in the overall progress
const PROGRESS_STAGES = {
  INITIALIZING: { weight: 5, message: 'Initializing export...' },
  FETCHING_SURVEYS: { weight: 10, message: 'Fetching survey data...' },
  FETCHING_QUESTIONS: { weight: 20, message: 'Fetching questions data...' },
  PROCESSING_QUESTIONS: { weight: 30, message: 'Processing questions...' },
  GENERATING_CHARTS: { weight: 25, message: 'Generating charts...' },
  COMPILING_PDF: { weight: 10, message: 'Compiling PDF...' },
};

export type ProgressStage = keyof typeof PROGRESS_STAGES;

class ProgressTracker {
  private currentProgress: ReactiveVar<number>;
  private currentStage: ReactiveVar<ProgressStage | null>;
  private additionalInfo: ReactiveVar<string>;
  private isActive: ReactiveVar<boolean>;
  private stageProgress: ReactiveDict;
  
  constructor() {
    this.currentProgress = new ReactiveVar<number>(0);
    this.currentStage = new ReactiveVar<ProgressStage | null>(null);
    this.additionalInfo = new ReactiveVar<string>('');
    this.isActive = new ReactiveVar<boolean>(false);
    this.stageProgress = new ReactiveDict();
    
    // Initialize stage progress
    Object.keys(PROGRESS_STAGES).forEach(stage => {
      this.stageProgress.set(stage, 0);
    });
  }
  
  // Start tracking progress
  start(): void {
    this.reset();
    this.isActive.set(true);
    this.setStage('INITIALIZING');
  }
  
  // Reset all progress
  reset(): void {
    this.currentProgress.set(0);
    this.currentStage.set(null);
    this.additionalInfo.set('');
    
    // Reset all stage progress
    Object.keys(PROGRESS_STAGES).forEach(stage => {
      this.stageProgress.set(stage, 0);
    });
  }
  
  // Set the current stage
  setStage(stage: ProgressStage, info: string = ''): void {
    this.currentStage.set(stage);
    if (info) {
      this.additionalInfo.set(info);
    }
    this.updateOverallProgress();
  }
  
  // Update progress within the current stage
  updateStageProgress(stage: ProgressStage, progress: number): void {
    // Ensure progress is between 0 and 100
    const normalizedProgress = Math.min(100, Math.max(0, progress));
    this.stageProgress.set(stage, normalizedProgress);
    this.updateOverallProgress();
  }
  
  // Set additional info text
  setAdditionalInfo(info: string): void {
    this.additionalInfo.set(info);
  }
  
  // Complete the progress tracking
  complete(): void {
    // Set all stages to 100%
    Object.keys(PROGRESS_STAGES).forEach(stage => {
      this.stageProgress.set(stage, 100);
    });
    
    this.currentProgress.set(100);
    this.setStage('COMPILING_PDF', 'Export complete!');
    
    // Small delay before marking as inactive
    setTimeout(() => {
      this.isActive.set(false);
    }, 500);
  }
  
  // Calculate and update the overall progress based on stage weights
  private updateOverallProgress(): void {
    let totalProgress = 0;
    let totalWeight = 0;
    
    Object.entries(PROGRESS_STAGES).forEach(([stage, config]) => {
      const stageProgress = this.stageProgress.get(stage) || 0;
      // Ensure we're working with numbers
      const progress = typeof stageProgress === 'number' ? stageProgress : parseFloat(stageProgress as string) || 0;
      totalProgress += (progress * config.weight);
      totalWeight += config.weight;
    });
    
    const overallProgress = totalWeight > 0 ? Math.round(totalProgress / totalWeight) : 0;
    this.currentProgress.set(overallProgress);
  }
  
  // Getters for reactive variables
  getProgress(): number {
    return this.currentProgress.get();
  }
  
  getStage(): ProgressStage | null {
    return this.currentStage.get();
  }
  
  getStageMessage(): string {
    const stage = this.currentStage.get();
    return stage ? PROGRESS_STAGES[stage].message : '';
  }
  
  getAdditionalInfo(): string {
    return this.additionalInfo.get();
  }
  
  isInProgress(): boolean {
    return this.isActive.get();
  }
}

// Create and export a singleton instance
export const progressTracker = new ProgressTracker();
