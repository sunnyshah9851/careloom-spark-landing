
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Heart, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingStepProps } from './types';

export const NudgeFrequencyStep = ({ data, setData }: OnboardingStepProps) => {
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
    <div className="text-center space-y-6">
      <div className="text-7xl mb-6">📬</div>
      <h2 className="text-2xl font-playfair text-rose-800 mb-2">
        General Relationship Nudges
      </h2>
      <p className="text-rose-700 mb-4 text-lg">
        How often would you like gentle nudges to spend quality time with {data.name}?
      </p>
      <div className="bg-rose-50 p-4 rounded-2xl mb-6 text-left">
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 text-rose-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-rose-800 font-medium mb-2">These nudges include:</p>
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
            <p className="text-xs text-rose-600 mt-3 italic">
              * Separate from birthday and anniversary reminders you've already set up
            </p>
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
  );
};
