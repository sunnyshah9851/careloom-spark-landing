
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Calendar, Mail, Heart, Gift } from 'lucide-react';
import PersonEditForm from './PersonEditForm';

interface Relationship {
  id: string;
  profile_id: string;
  relationship_type: string;
  name: string;
  email?: string;
  birthday?: string;
  anniversary?: string;
  notes?: string;
  last_nudge_sent?: string;
  tags?: string[];
  created_at: string;
}

interface PersonCardProps {
  relationship: Relationship;
  onUpdate: () => void;
}

const PersonCard = ({ relationship, onUpdate }: PersonCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isEditing) {
    return (
      <Card className="shadow-lg border-2 border-gray-100 hover:border-rose-200 transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Editing {relationship.name}
              </CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PersonEditForm 
            relationship={relationship}
            onSave={() => {
              setIsEditing(false);
              onUpdate();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-gray-100 hover:border-rose-200 transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {relationship.name}
              </CardTitle>
              <Badge variant="secondary" className="mt-1 bg-rose-100 text-rose-700">
                {relationship.relationship_type}
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Important Dates Section */}
        <div className="grid grid-cols-2 gap-3">
          {/* Birthday */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-800">Birthday</span>
            </div>
            <p className="text-sm font-medium text-amber-700">
              {relationship.birthday ? formatDateShort(relationship.birthday) : 'Not set'}
            </p>
          </div>

          {/* Anniversary */}
          <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-medium text-rose-800">Anniversary</span>
            </div>
            <p className="text-sm font-medium text-rose-700">
              {relationship.anniversary ? formatDateShort(relationship.anniversary) : 'Not set'}
            </p>
          </div>
        </div>

        {/* Email */}
        {relationship.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{relationship.email}</span>
          </div>
        )}

        {/* Notes */}
        {relationship.notes && (
          <div>
            <span className="text-xs text-gray-500">Notes</span>
            <p className="text-sm text-gray-600 mt-1">{relationship.notes}</p>
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-gray-400 pt-2 border-t">
          Added on {formatDate(relationship.created_at)}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonCard;
