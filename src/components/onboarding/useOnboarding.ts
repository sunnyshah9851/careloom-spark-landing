
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OnboardingData } from './types';

export const useOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    relationshipType: 'partner',
    relationshipCity: '',
    birthday: null,
    birthdayNudgeEnabled: true,
    birthdayNudgeFrequency: '1_week',
    anniversary: null,
    anniversaryNudgeEnabled: true,
    anniversaryNudgeFrequency: '1_week',
    nudgeFrequency: 'weekly',
    city: ''
  });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async (onComplete: () => void) => {
    if (!user) return;

    try {
      // First, save/update the user's profile with city and nudge frequency
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          city: data.city,
          nudge_frequency: data.nudgeFrequency,
        });

      if (profileError) throw profileError;

      // Then, save the relationship with the new nudge preferences
      const { error: relationshipError } = await supabase
        .from('relationships')
        .insert({
          profile_id: user.id,
          name: data.name,
          relationship_type: data.relationshipType,
          city: data.relationshipCity,
          birthday: data.birthday || null,
          anniversary: data.anniversary || null,
          birthday_notification_frequency: data.birthdayNudgeEnabled ? data.birthdayNudgeFrequency : 'none',
          anniversary_notification_frequency: data.anniversaryNudgeEnabled ? data.anniversaryNudgeFrequency : 'none',
          notes: `General nudge frequency: ${data.nudgeFrequency}`,
        });

      if (relationshipError) throw relationshipError;

      toast({
        title: "Welcome to Careloom! 🎉",
        description: "Your relationship and reminder preferences have been set up successfully.",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Name
        return data.name.trim().length > 0;
      case 2: // Relationship Type
        return true; // Has default
      case 3: // Relationship City
        return data.relationshipCity.trim().length > 0;
      case 4: // Birthday + Birthday Nudge
        return data.birthday !== null;
      case 5: // Anniversary + Anniversary Nudge
        return true; // Anniversary is optional
      case 6: // General Relationship Nudges
        return true; // Has default
      case 7: // Your City
        return data.city.trim().length > 0;
      default:
        return false;
    }
  };

  return {
    currentStep,
    data,
    setData,
    totalSteps,
    progress,
    handleNext,
    handleBack,
    handleSkip,
    handleComplete,
    canProceed: canProceed()
  };
};
