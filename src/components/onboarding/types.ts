
export interface OnboardingData {
  name: string;
  relationshipType: string;
  relationshipCity: string;
  birthday: Date | null;
  birthdayNudgeEnabled: boolean;
  birthdayNudgeFrequency: string;
  anniversary: Date | null;
  anniversaryNudgeEnabled: boolean;
  anniversaryNudgeFrequency: string;
  nudgeFrequency: string;
  city: string;
}

export interface OnboardingStepProps {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  canProceed: boolean;
}

export interface OnboardingProps {
  onComplete: () => void;
}
