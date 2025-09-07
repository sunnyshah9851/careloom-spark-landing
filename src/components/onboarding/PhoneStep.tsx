import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingStepProps } from './types';

export const PhoneStep = ({ data, setData }: OnboardingStepProps) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-7xl mb-6">📱</div>
      <h2 className="text-2xl font-playfair text-rose-800 mb-2">
        Add a WhatsApp number (optional)
      </h2>
      <p className="text-rose-700 mb-8 text-lg">
        We’ll use this to open a chat with {data.name} right from their card.
      </p>

      <div className="text-left space-y-2">
        <Label htmlFor="onboarding-phone" className="text-sm font-medium text-rose-800">
          WhatsApp number (E.164 format)
        </Label>
        <Input
          id="onboarding-phone"
          type="tel"
          value={data.phoneNumber || ''}
          onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
          placeholder="+14155551234 or +91XXXXXXXXXX"
          className="w-full border-gray-300 focus:border-rose-500 focus:ring-rose-500 text-black placeholder:text-gray-500"
        />
        <p className="text-xs text-gray-500">
          Include country code. You can skip this now and add it later.
        </p>
      </div>
    </div>
  );
};

export default PhoneStep;
