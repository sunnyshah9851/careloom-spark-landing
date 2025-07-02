
import { CityInput } from '@/components/ui/city-input';
import { OnboardingStepProps } from './types';

export const RelationshipCityStep = ({ data, setData }: OnboardingStepProps) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-7xl mb-6">📍</div>
      <h2 className="text-2xl font-playfair text-rose-800 mb-2">
        What city does {data.name} live in?
      </h2>
      <p className="text-rose-700 mb-8 text-lg">
        We'll use this to suggest local activities and date ideas for when you're together
      </p>
      <div className="space-y-5">
        <div>
          <CityInput
            value={data.relationshipCity}
            onChange={(value) => setData({ ...data, relationshipCity: value })}
            placeholder="Search for their city..."
            className="text-xl py-4 text-center border-2 border-rose-200 focus:border-rose-400 rounded-2xl bg-rose-50/50 placeholder:text-rose-500 text-rose-800"
          />
          <p className="text-xs text-rose-600 mt-2 opacity-75">e.g., San Francisco, New York, London</p>
        </div>
      </div>
    </div>
  );
};
