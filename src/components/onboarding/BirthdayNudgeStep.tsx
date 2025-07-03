
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { OnboardingStepProps } from './types';

export const BirthdayNudgeStep = ({ data, setData }: OnboardingStepProps) => {
  const nudgeOptions = [
    { value: '1_day', label: '1 day before', emoji: '📅' },
    { value: '3_days', label: '3 days before', emoji: '📆' },
    { value: '1_week', label: '1 week before', emoji: '🗓️' },
    { value: '2_weeks', label: '2 weeks before', emoji: '📋' },
    { value: '1_month', label: '1 month before', emoji: '🗃️' }
  ];

  return (
    <div className="text-center space-y-6">
      <div className="text-7xl mb-6">🎂</div>
      <h2 className="text-2xl font-playfair text-rose-800 mb-2">
        Birthday Reminders for {data.name}
      </h2>
      <p className="text-rose-700 mb-8 text-lg">
        Would you like us to remind you about {data.name}'s birthday?
      </p>
      
      <div className="flex items-center justify-center space-x-4 mb-6">
        <span className="text-rose-800 font-medium">Remind me</span>
        <Switch
          checked={data.birthdayNudgeEnabled}
          onCheckedChange={(checked) => 
            setData({ ...data, birthdayNudgeEnabled: checked })
          }
          className="data-[state=checked]:bg-rose-500"
        />
      </div>

      {data.birthdayNudgeEnabled && (
        <div className="space-y-4">
          <p className="text-rose-700 text-lg mb-4">How early would you like to be reminded?</p>
          <RadioGroup
            value={data.birthdayNudgeFrequency}
            onValueChange={(value) => setData({ ...data, birthdayNudgeFrequency: value })}
            className="space-y-3"
          >
            {nudgeOptions.map((option) => (
              <label 
                key={option.value} 
                htmlFor={option.value}
                className={cn(
                  "flex items-center space-x-4 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-105",
                  data.birthdayNudgeFrequency === option.value 
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
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
};
