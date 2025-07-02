import { Input } from '@/components/ui/input';
import { OnboardingStepProps } from './types';

export const NameStep = ({ data, setData }: OnboardingStepProps) => {
  return (
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
  );
};