
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface OnboardingData {
  partnerFirstName: string;
  partnerLastName: string;
  partnerBirthday: Date | null;
  anniversaryDate: Date | null;
  reminderFrequency: string;
}

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    partnerFirstName: '',
    partnerLastName: '',
    partnerBirthday: null,
    anniversaryDate: null,
    reminderFrequency: 'weekly'
  });

  const totalSteps = 4;
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

  const handleComplete = async () => {
    if (!user) return;

    try {
      const partnerName = `${data.partnerFirstName} ${data.partnerLastName}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          partner_name: partnerName,
          partner_birthday: data.partnerBirthday?.toISOString().split('T')[0] || null,
          anniversary_date: data.anniversaryDate?.toISOString().split('T')[0] || null,
          reminder_frequency: data.reminderFrequency,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Welcome to Careloom! 🎉",
        description: "Your profile has been set up successfully.",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
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
        return data.partnerFirstName.trim().length > 0 && data.partnerLastName.trim().length > 0;
      case 2:
        return data.partnerBirthday !== null;
      case 3:
        return true; // Anniversary is optional
      case 4:
        return true; // Frequency has a default
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="mb-8 text-center">
          <p className="text-rose-600 text-sm mb-3">Step {currentStep} of {totalSteps}</p>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Step 1: Partner's Name */}
            {currentStep === 1 && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">💝</div>
                <h2 className="text-2xl font-playfair text-rose-800 mb-2">
                  Who's someone really important to you?
                </h2>
                <p className="text-rose-600 mb-6">
                  This could be your partner, best friend, or anyone special in your life
                </p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName" className="text-rose-700 text-sm font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      value={data.partnerFirstName}
                      onChange={(e) => setData({ ...data, partnerFirstName: e.target.value })}
                      placeholder="Their first name..."
                      className="text-lg py-3 text-center border-rose-200 focus:border-rose-400 mt-1"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-rose-700 text-sm font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      value={data.partnerLastName}
                      onChange={(e) => setData({ ...data, partnerLastName: e.target.value })}
                      placeholder="Their last name..."
                      className="text-lg py-3 text-center border-rose-200 focus:border-rose-400 mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Partner's Birthday */}
            {currentStep === 2 && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎂</div>
                <h2 className="text-2xl font-playfair text-rose-800 mb-2">
                  When's {data.partnerFirstName}'s birthday?
                </h2>
                <p className="text-rose-600 mb-6">
                  We'll make sure you never miss this special day
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full py-3 text-lg justify-center",
                        !data.partnerBirthday && "text-muted-foreground"
                      )}
                    >
                      {data.partnerBirthday ? (
                        format(data.partnerBirthday, "MMMM do, yyyy")
                      ) : (
                        <span>Pick their birthday</span>
                      )}
                      <CalendarIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={data.partnerBirthday || undefined}
                      onSelect={(date) => setData({ ...data, partnerBirthday: date || null })}
                      className="pointer-events-auto"
                      initialFocus
                      defaultMonth={new Date(1990, 0)}
                      captionLayout="dropdown-buttons"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Step 3: Anniversary */}
            {currentStep === 3 && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">💖</div>
                <h2 className="text-2xl font-playfair text-rose-800 mb-2">
                  Do you two celebrate an anniversary?
                </h2>
                <p className="text-rose-600 mb-6">
                  We can help you remember this special milestone too
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full py-3 text-lg justify-center mb-4",
                        !data.anniversaryDate && "text-muted-foreground"
                      )}
                    >
                      {data.anniversaryDate ? (
                        format(data.anniversaryDate, "MMMM do, yyyy")
                      ) : (
                        <span>Pick your anniversary</span>
                      )}
                      <CalendarIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={data.anniversaryDate || undefined}
                      onSelect={(date) => setData({ ...data, anniversaryDate: date || null })}
                      className="pointer-events-auto"
                      initialFocus
                      defaultMonth={new Date(2020, 0)}
                      captionLayout="dropdown-buttons"
                      fromYear={1980}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  onClick={() => setData({ ...data, anniversaryDate: null })}
                  className="text-rose-500 hover:text-rose-700"
                >
                  Skip for now
                </Button>
              </div>
            )}

            {/* Step 4: Reminder Frequency */}
            {currentStep === 4 && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-2xl font-playfair text-rose-800 mb-2">
                  How often would you like thoughtful nudges?
                </h2>
                <p className="text-rose-600 mb-6">
                  We'll send gentle reminders to help you stay connected
                </p>
                <RadioGroup
                  value={data.reminderFrequency}
                  onValueChange={(value) => setData({ ...data, reminderFrequency: value })}
                  className="space-y-4"
                >
                  {[
                    { value: 'weekly', label: 'Weekly', desc: 'Perfect for staying close' },
                    { value: 'biweekly', label: 'Every 2 weeks', desc: 'Just the right amount' },
                    { value: 'monthly', label: 'Monthly', desc: 'For the important moments' }
                  ].map((option) => (
                    <Label 
                      key={option.value} 
                      htmlFor={option.value}
                      className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-rose-800">
                          {option.label}
                        </div>
                        <p className="text-sm text-rose-600">{option.desc}</p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-rose-100">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="text-rose-600"
              >
                Back
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-rose-500 hover:bg-rose-600 px-8"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="bg-rose-500 hover:bg-rose-600 px-8"
                >
                  Let's get started! ✨
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
