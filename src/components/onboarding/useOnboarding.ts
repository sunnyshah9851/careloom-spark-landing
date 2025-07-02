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
    birthday: null,
    anniversary: null,
    nudgeFrequency: 'weekly',
    city: ''
  });

  const totalSteps = 6;
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

      // Then, save the relationship
      const { error: relationshipError } = await supabase
        .from('relationships')
        .insert({
          profile_id: user.id,
          name: data.name,
          relationship_type: data.relationshipType,
          birthday: data.birthday?.toISOString().split('T')[0] || null,
          anniversary: data.anniversary?.toISOString().split('T')[0] || null,
          notes: `Nudge frequency: ${data.nudgeFrequency}`,
        });

      if (relationshipError) throw relationshipError;

      toast({
        title: "Welcome to Careloom! 🎉",
        description: "Your relationship has been set up successfully.",
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
      case 1:
        return data.name.trim().length > 0;
      case 2:
        return true; // Relationship type has default
      case 3:
        return data.birthday !== null;
      case 4:
        return true; // Anniversary is optional
      case 5:
        return true; // Nudge frequency has default
      case 6:
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