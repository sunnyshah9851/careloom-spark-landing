import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { OnboardingStepProps } from './types';

export const RelationshipTypeStep = ({ data, setData }: OnboardingStepProps) => {
  const relationshipOptions = [
    { value: 'partner', label: 'Partner', desc: 'Romantic partner or spouse', emoji: '💖' },
    { value: 'friend', label: 'Friend', desc: 'Close friend or best friend', emoji: '👫' },
    { value: 'family', label: 'Family', desc: 'Family member or relative', emoji: '👨‍👩‍👧‍👦' },
    { value: 'other', label: 'Other', desc: 'Someone else special to you', emoji: '✨' }
  ];

  return (
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
        {relationshipOptions.map((option) => (
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
  );
};