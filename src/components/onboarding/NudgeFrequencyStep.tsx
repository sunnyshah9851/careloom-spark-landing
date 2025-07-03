
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, Sparkles, Calendar, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingStepProps } from './types';

export const NudgeFrequencyStep = ({ data, setData }: OnboardingStepProps) => {
  const nudgeOptions = [
    {
      value: 'weekly',
      label: 'Weekly Magic ✨',
      description: 'Fresh date ideas every Friday',
      emoji: '🔥',
      highlight: 'Most Popular!'
    },
    {
      value: 'biweekly',
      label: 'Bi-Weekly Boost 💫',
      description: 'Curated experiences every 2 weeks',
      emoji: '⭐'
    },
    {
      value: 'monthly',
      label: 'Monthly Moments 🌟',
      description: 'Special date ideas once a month',
      emoji: '💎'
    }
  ];

  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">💌</div>
      <h2 className="text-3xl font-playfair text-rose-800 mb-2">
        Get Irresistible Date Ideas! 
      </h2>
      <p className="text-rose-700 mb-2 text-xl font-medium">
        Never run out of romantic ideas for {data.name} again
      </p>
      <p className="text-rose-600 text-lg mb-6">
        Join 10,000+ couples who never have boring weekends ✨
      </p>
      
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-3xl mb-8 text-left border-2 border-rose-200">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">🎯</div>
          <div>
            <p className="text-rose-800 font-bold text-lg mb-3">You'll get personalized:</p>
            <div className="space-y-3 text-rose-700">
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-rose-500" />
                <span className="font-medium">3 curated date ideas perfectly matched to your relationship</span>
              </div>
              <div className="flex items-center space-x-3">
                <Coffee className="h-5 w-5 text-rose-500" />
                <span className="font-medium">Local hotspots and hidden gems in your city</span>
              </div>
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-rose-500" />
                <span className="font-medium">Budget-friendly to luxury options</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-rose-500" />
                <span className="font-medium">Seasonal activities and special events</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-rose-100 rounded-2xl">
              <p className="text-sm text-rose-800 font-medium">
                🚀 <strong>Pro tip:</strong> Couples who get weekly nudges report 40% more quality time together!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-lg font-semibold text-rose-800 mb-4">
        How often do you want to be inspired?
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
              "relative flex items-center space-x-4 p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg",
              data.nudgeFrequency === option.value 
                ? "bg-gradient-to-r from-rose-100 to-pink-100 border-rose-400 shadow-xl" 
                : "border-rose-200 hover:bg-rose-50 hover:border-rose-300"
            )}
          >
            {option.highlight && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                {option.highlight}
              </div>
            )}
            <RadioGroupItem value={option.value} id={option.value} className="w-6 h-6" />
            <div className="text-3xl">{option.emoji}</div>
            <div className="flex-1 text-left">
              <div className="font-bold text-rose-800 text-xl">
                {option.label}
              </div>
              <p className="text-rose-700 text-lg">{option.description}</p>
            </div>
          </label>
        ))}
      </RadioGroup>

      <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
        <p className="text-yellow-800 font-semibold text-lg">
          ⚡ Limited Time: First month of premium date ideas FREE!
        </p>
        <p className="text-yellow-700 text-sm mt-1">
          Usually $9.99/month • Cancel anytime
        </p>
      </div>
    </div>
  );
};
