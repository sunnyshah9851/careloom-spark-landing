import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { NameStep } from './NameStep';
import { RelationshipTypeStep } from './RelationshipTypeStep';
import { BirthdayStep } from './BirthdayStep';
import { AnniversaryStep } from './AnniversaryStep';
import { NudgeFrequencyStep } from './NudgeFrequencyStep';
import { CityStep } from './CityStep';
import { useOnboarding } from './useOnboarding';
import { OnboardingProps } from './types';

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const {
    currentStep,
    data,
    setData,
    totalSteps,
    progress,
    handleNext,
    handleBack,
    handleSkip,
    handleComplete,
    canProceed
  } = useOnboarding();

  const stepProps = {
    data,
    setData,
    onNext: handleNext,
    onBack: handleBack,
    onSkip: handleSkip,
    canProceed
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <NameStep {...stepProps} />;
      case 2:
        return <RelationshipTypeStep {...stepProps} />;
      case 3:
        return <BirthdayStep {...stepProps} />;
      case 4:
        return <AnniversaryStep {...stepProps} />;
      case 5:
        return <NudgeFrequencyStep {...stepProps} />;
      case 6:
        return <CityStep {...stepProps} />;
      default:
        return <NameStep {...stepProps} />;
    }
  };

  return (
    <div className="min-h-screen gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="mb-8 text-center">
          <p className="text-rose-700 text-sm mb-3 font-medium">Step {currentStep} of {totalSteps}</p>
          <Progress value={progress} className="h-2 bg-rose-100">
            <div 
              className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </Progress>
        </div>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            {renderStep()}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-rose-100">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="text-rose-700 text-lg py-3 px-6 rounded-2xl hover:bg-rose-50"
              >
                Back
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 px-8 py-3 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  Continue ✨
                </Button>
              ) : (
                <Button
                  onClick={() => handleComplete(onComplete)}
                  className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 px-8 py-3 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Let's get started! 🎉
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;