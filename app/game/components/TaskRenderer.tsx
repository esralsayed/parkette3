// app/components/TaskRenderer.tsx
//
// summary for the component: 


import React, { useEffect, useState } from 'react';
import { GameStep } from '../../adapters/LevelAdapter';
import ChoiceModal, { ChoiceOption } from './minigames/ChoiceModal';

import { TaskAnswer } from '../interfaces/TaskAnswer';

// 1- has 2 props step and onAnswered. 
// step is of type gameStep which is imported from levelAdapter -> go to levelAdapter to understand more
// onAnswered is a function that takes a "correct" boolean and an "answer" parameters
interface TaskRendererProps {
  step: GameStep;
  onAnswered: (answer: TaskAnswer) => void;
}

// 2- main function is TaskRenderer which takes step and onAnswered as props defined by the taskRendererProps interface., this helps in type casting
// inside the function there is 2 states: showChoiceModal and choiceOptions
// showChoiceModal is a boolean modalthat determins when the choice modal opens
// choiceOptions is an array of choice options

export default function TaskRenderer({ step, onAnswered }: TaskRendererProps) {
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [choiceOptions, setChoiceOptions] = useState<ChoiceOption[]>([]);


// 3- this useEffect runs whenever step.taskType or step.content changes.
// what is step.tasktype? -> it was based as a prop and it as the information for a task
// similary -> step.content
// the if condition checks if the tasktype is a choice and the options are there (since the data type inside the content is mixed that could be changed)
// if this condition is true -> means we have a choice task -> we want to start displaying the choice modal
// but first we have to map the options into this speicfic format
// after that we set the choice options and choice modal

// changes 20/4/26 -> i removed the hint and icon fields idt it is needed
    useEffect(() => {
    if (step.taskType === 'choice' && step.content?.options) {
      const options: ChoiceOption[] = step.content.options.map((opt: any, idx: number) => ({
        id: idx,
        text: opt.text || opt,
        correct: opt.correct === true,
        feedback: opt.feedback,
        continuationSteps: opt.continuationSteps || []
      }));
      setChoiceOptions(options);
      setShowChoiceModal(true);
    }
  }, [step.taskType, step.content]);

// 4- this function handles when an option is selected
// it takes an answer as paratmeter -> and sets onAnswered with the answer 
// handleChoiceselect is called by the onSelect of the choicemodal
// the choiceModal onselect returns an answer format that is now stored in the onAnswer

  const handleChoiceSelect = (answer: TaskAnswer) => {
    setShowChoiceModal(false);
    onAnswered(answer);
  };


  // 5- this is where i render my choiceModal

  if (step.taskType === 'choice') {
    return (
      <ChoiceModal
        visible={showChoiceModal}
        title="Choose Wisely!"
        instruction={step.instruction || step.text || 'Select the correct answer'}
        options={choiceOptions}
        onSelect={handleChoiceSelect}
        timeLimit={step.metadata?.timeLimit}
        showCharacterHint={true}
      />
    );
  }

  // All other task types are rendered in-scene by levelPlayer — nothing to render here.
  return null;
}