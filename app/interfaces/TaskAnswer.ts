export interface TaskAnswer {
  isCorrect: boolean;
  choice?: string;
  optionId?: string | number;
  continuationSteps?: Array<{
    type: 'narrate' | 'dialog';
    text?: string;
    speaker?: string;
  }>;
correctText: string;

}