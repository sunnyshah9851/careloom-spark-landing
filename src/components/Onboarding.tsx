import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, Mail, Heart, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  name: string;
  relationshipType: string;
  birthday: Date | null;
  anniversary: Date | null;
  nudgeFrequency: string;
  city: string;
}

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
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

  const totalSteps = 6; // Updated to include city step
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

  const handleComplete = async () => {
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

  const nudgeOptions = [
    {
      value: 'weekly',
      label: 'Weekly',
      description: 'Every week on Friday',
      emoji: '📅'
    },
    {
      value: 'biweekly',
      label: 'Bi-weekly',
      description: 'Every other Friday',
      emoji: '📆'
    },
    {
      value: 'monthly',
      label: 'Monthly',
      description: 'First Friday of each month',
      emoji: '🗓️'
    }
  ];

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
            {/* Step 1: Person's Name */}
            {currentStep === 1 && (
              <div className="text-center space-y-6">
                <div className="text-7xl mb-6 animate-pulse">💝</div>
                <h2 className="text-2xl font-playfair text-rose-800 mb-2">
                  Who's someone really important to you?
                </h2>
                <p className="text-rose-700 mb-8 text-lg">
                  This could be your partner, best friend, family member, or anyone special in your life
                </p>
                <div className="space-y-5">
                  <div>
                    <Input
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      placeholder="What's their name?"
                      className="text-xl py-4 text-center border-2 border-rose-200 focus:border-rose-400 rounded-2xl bg-rose-50/50 placeholder:text-rose-500 text-rose-800"
                      autoFocus
                    />
                    <p className="text-xs text-rose-600 mt-2 opacity-75">Their first name or full name</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Relationship Type */}
            {currentStep === 2 && (
              <div className="text-center space-y-6">
                <div className="text-7xl mb-6">💕</div>
                <h2 className="text-2xl font-playfair text-rose-800 mb-2">
                  How would you describe your relationship with {data.name}?
                </h2>
                <p className="text-rose-700 mb-8 text-lg">
                  This helps us personalize your experience
                </p>
                <RadioGroup
                  value={data.relationshipType}
                  onValueChange={(value) => setData({ ...data, relationshipType: value })}
                  className="space-y-4"
                >
                  {[
                    { value: 'partner', label: 'Partner', desc: 'Romantic partner or spouse', emoji: '💖' },
                    { value: 'friend', label: 'Friend', desc: 'Close friend or best friend', emoji: '👫' },
                    { value: 'family', label: 'Family', desc: 'Family member or relative', emoji: '👨‍👩‍👧‍👦' },
                    { value: 'other', label: 'Other', desc: 'Someone else special to you', emoji: '✨' }
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      htmlFor={option.value}
                      className={cn(
                        "flex items-center space-x-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-105",
                        data.relationshipType === option.value 
                          ? "bg-rose-50 border-rose-400 shadow-lg" 
                          : "border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                      )}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="w-5 h-5" />
                      <div className="text-2xl">{option.emoji}</div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-rose-800 text-lg">
                          {option.label}
                        </div>
                        <p className="text-sm text-rose-700">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Birthday */}
            {currentStep === 3 && (
              <div className="text-center space-y-6">
                <div className="text-7xl mb-6">🎂</div>
                <h2 className="text-2xl font-playfair text-rose-800 mb-2">
                  When's {data.name}'s birthday?
                </h2>
                <p className="text-rose-700 mb-8 text-lg">
                  We'll make sure you never miss this special day
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full py-6 text-xl justify-center rounded-2xl border-2 transition-all duration-200 hover:scale-105 text-rose-800",
                        data.birthday 
                          ? "bg-rose-50 border-rose-300 shadow-lg" 
                          : "border-rose-200 hover:border-rose-300 hover:bg-rose-50"
                      )}
                    >
                      {data.birthday ? (
                        <span className="font-medium">
                          {format(data.birthday, "MMMM do, yyyy")}
                        </span>
                      ) : (
                        <span>Pick their birthday ✨</span>
                      )}
                      <CalendarIcon className="ml-3 h-6 w-6" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-2 border-rose-200 rounded-2xl shadow-2xl" align="center">
                    <Calendar
                      mode="single"
                      selected={data.birthday || undefined}
                      onSelect={(date) => setData({ ...data, birthday: date || null })}
                      className="pointer-events-auto rounded-2xl"
                      initialFocus
                      defaultMonth={new Date(1990, 0)}
                      captionLayout="dropdown-buttons"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-lg font-medium text-rose-800",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-8 w-8 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl transition-colors",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-rose-700 rounded-lg w-10 font-normal text-sm",
                        row: "flex w-full mt-2",
                        cell: "h-10 w-10 text-center text-sm p-0 relative hover:bg-rose-100 rounded-lg transition-colors",
                        day: "h-10 w-10 p-0 font-normal rounded-lg hover:bg-rose-200 transition-colors text-rose-800",
                        day_selected: "bg-rose-500 text-white hover:bg-rose-600 font-medium",
                        day_today: "bg-rose-100 text-rose-800 font-medium",
                        day_outside: "text-rose-400 opacity-50",
                        day_disabled: "text-rose-300 opacity-30",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Step 4: Anniversary */}
            {currentStep === 4 && (
              <div className="text-center space-y-6">
                <div className="text-7xl mb-6">💖</div>
                <h2 className="text-2xl font-playfair text-rose-800 mb-2">
                  Do you celebrate an anniversary with {data.name}?
                </h2>
                <p className="text-rose-700 mb-8 text-lg">
                  We can help you remember this special milestone too
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full py-6 text-xl justify-center rounded-2xl border-2 mb-6 transition-all duration-200 hover:scale-105 text-rose-800",
                        data.anniversary 
                          ? "bg-rose-50 border-rose-300 shadow-lg" 
                          : "border-rose-200 hover:border-rose-300 hover:bg-rose-50"
                      )}
                    >
                      {data.anniversary ? (
                        <span className="font-medium">
                          {format(data.anniversary, "MMMM do, yyyy")}
                        </span>
                      ) : (
                        <span>Pick your anniversary ✨</span>
                      )}
                      <CalendarIcon className="ml-3 h-6 w-6" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-2 border-rose-200 rounded-2xl shadow-2xl" align="center">
                    <Calendar
                      mode="single"
                      selected={data.anniversary || undefined}
                      onSelect={(date) => setData({ ...data, anniversary: date || null })}
                      className="pointer-events-auto rounded-2xl"
                      initialFocus
                      defaultMonth={new Date(2020, 0)}
                      captionLayout="dropdown-buttons"
                      fromYear={1980}
                      toYear={new Date().getFullYear()}
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-lg font-medium text-rose-800",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-8 w-8 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl transition-colors",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-rose-700 rounded-lg w-10 font-normal text-sm",
                        row: "flex w-full mt-2",
                        cell: "h-10 w-10 text-center text-sm p-0 relative hover:bg-rose-100 rounded-lg transition-colors",
                        day: "h-10 w-10 p-0 font-normal rounded-lg hover:bg-rose-200 transition-colors text-rose-800",
                        day_selected: "bg-rose-500 text-white hover:bg-rose-600 font-medium",
                        day_today: "bg-rose-100 text-rose-800 font-medium",
                        day_outside: "text-rose-400 opacity-50",
                        day_disabled: "text-rose-300 opacity-30",
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-rose-600 hover:text-rose-700 text-lg py-3 px-6 rounded-2xl hover:bg-rose-50"
                >
                  Skip for now 💫
                </Button>
              </div>
            )}

            {/* Step 5: Nudge Preferences */}
            {currentStep === 5 && (
              <div className="text-center space-y-6">
                <div className="text-7xl mb-6">📬</div>
                <h2 className="text-2xl font-playfair text-rose-800 mb-2">
                  How often would you like gentle nudges?
                </h2>
                <div className="bg-rose-50 p-4 rounded-2xl mb-6 text-left">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-rose-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-rose-800 font-medium mb-2">What to expect:</p>
                      <div className="space-y-2 text-sm text-rose-700">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4" />
                          <span>Email reminders to plan quality time with {data.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>Top 3 date ideas and activities in your city</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-rose-500">✨</span>
                          <span>Personalized suggestions based on your relationship type</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <RadioGroup
                  value={data.nudgeFrequency}
                  onValueChange={(value) => setData({ ...data, nudgeFrequency: value })}
                  className="space-y-4"
                >
                  {nudgeOptions.map((option) => (
                    <label 
                      key={option.value} 
                      htmlFor={option.value}
                      className={cn(
                        "flex items-center space-x-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-105",
                        data.nudgeFrequency === option.value 
                          ? "bg-rose-50 border-rose-400 shadow-lg" 
                          : "border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                      )}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="w-5 h-5" />
                      <div className="text-2xl">{option.emoji}</div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-rose-800 text-lg">
                          {option.label}
                        </div>
                        <p className="text-sm text-rose-700">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 6: City */}
            {currentStep === 6 && (
              <div className="text-center space-y-6">
                <div className="text-7xl mb-6">🏙️</div>
                <h2 className="text-2xl font-playfair text-rose-800 mb-2">
                  What city do you live in?
                </h2>
                <p className="text-rose-700 mb-8 text-lg">
                  We'll use this to suggest local date ideas and activities
                </p>
                <div className="space-y-5">
                  <div>
                    <Input
                      value={data.city}
                      onChange={(e) => setData({ ...data, city: e.target.value })}
                      placeholder="Enter your city"
                      className="text-xl py-4 text-center border-2 border-rose-200 focus:border-rose-400 rounded-2xl bg-rose-50/50 placeholder:text-rose-500 text-rose-800"
                      autoFocus
                    />
                    <p className="text-xs text-rose-600 mt-2 opacity-75">e.g., San Francisco, New York, London</p>
                  </div>
                </div>
              </div>
            )}

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
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 px-8 py-3 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  Continue ✨
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
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
