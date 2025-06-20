
import ProfileEditor from './ProfileEditor';

interface Profile {
  full_name: string;
  partner_name: string;
  user_birthday: string;
  partner_birthday: string;
  anniversary_date: string;
  reminder_frequency: string;
}

interface DashboardProfileProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => Promise<void>;
}

const DashboardProfile = ({ profile, onProfileUpdate }: DashboardProfileProps) => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-rose-800 mb-2">
          Profile Settings
        </h1>
        <p className="text-rose-600 text-lg">
          Update your relationship information
        </p>
      </div>

      <ProfileEditor profile={profile} onProfileUpdate={onProfileUpdate} />
    </div>
  );
};

export default DashboardProfile;
