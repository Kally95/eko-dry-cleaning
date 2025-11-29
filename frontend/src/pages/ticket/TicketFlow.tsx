import React, { useState } from 'react';
import { ModeSelection } from './ModeSelection';
import { PinEntry } from './PinEntry';
import { OrderForm } from './OrderForm';
import { Confirmation } from './Confirmation';
import { Success } from './Success';
import { useTicketStore } from '../../stores/ticketStore';

type Step =
  | 'mode'
  | 'pin'
  | 'form'
  | 'confirmation'
  | 'success';

export const TicketFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('mode');
  const { resetForm, resetAll } = useTicketStore();

  const handleNext = (step: Step) => {
    setCurrentStep(step);
  };

  const handleBack = (step: Step) => {
    setCurrentStep(step);
  };

  const handleNewTicketSameSite = () => {
    resetForm();
    setCurrentStep('form');
  };

  const handleChangeSite = () => {
    resetAll();
    setCurrentStep('mode');
  };

  return (
    <>
      {currentStep === 'mode' && (
        <ModeSelection onNext={() => handleNext('pin')} />
      )}

      {currentStep === 'pin' && (
        <PinEntry
          onNext={() => handleNext('form')}
          onBack={() => handleBack('mode')}
        />
      )}

      {currentStep === 'form' && (
        <OrderForm
          onNext={() => handleNext('confirmation')}
          onBack={() => handleBack('pin')}
        />
      )}

      {currentStep === 'confirmation' && (
        <Confirmation
          onNext={() => handleNext('success')}
          onBack={() => handleBack('form')}
        />
      )}

      {currentStep === 'success' && (
        <Success
          onNewTicketSameSite={handleNewTicketSameSite}
          onChangeSite={handleChangeSite}
        />
      )}
    </>
  );
};
