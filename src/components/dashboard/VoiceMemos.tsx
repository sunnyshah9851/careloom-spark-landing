
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mic, Plus, Trash2, MessageSquare } from 'lucide-react';

interface VoiceMemo {
  id: string;
  title: string;
  content: string;
  dateCreated: string;
  relationshipId?: string;
  tags: string[];
}

interface VoiceMemosProps {
  memos: VoiceMemo[];
  onAddMemo: (memo: Omit<VoiceMemo, 'id'>) => void;
  onDeleteMemo: (memoId: string) => void;
}

const VoiceMemos = ({ memos, onAddMemo, onDeleteMemo }: VoiceMemosProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMemo, setNewMemo] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    tagInput: ''
  });

  const handleAddMemo = () => {
    if (newMemo.title && newMemo.content) {
      onAddMemo({
        title: newMemo.title,
        content: newMemo.content,
        tags: newMemo.tags,
        dateCreated: new Date().toISOString()
      });
      setNewMemo({
        title: '',
        content: '',
        tags: [],
        tagInput: ''
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleAddTag = () => {
    if (newMemo.tagInput.trim() && !newMemo.tags.includes(newMemo.tagInput.trim())) {
      setNewMemo(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewMemo(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-rose-800">
              <MessageSquare className="h-5 w-5" />
              Voice Memos & Notes
            </CardTitle>
            <CardDescription>Capture thoughts and memories about your relationships</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                <Plus className="h-4 w-4 mr-1" />
                Add Memo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Voice Memo</DialogTitle>
                <DialogDescription>Record your thoughts and memories</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="What's this memory about?"
                    value={newMemo.title}
                    onChange={(e) => setNewMemo(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="Write your thoughts, memories, or voice transcription here..."
                    value={newMemo.content}
                    onChange={(e) => setNewMemo(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newMemo.tagInput}
                      onChange={(e) => setNewMemo(prev => ({ ...prev, tagInput: e.target.value }))}
                      onKeyPress={handleTagInputKeyPress}
                    />
                    <Button type="button" onClick={handleAddTag} size="sm">
                      Add
                    </Button>
                  </div>
                  {newMemo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newMemo.tags.map((tag) => (
                        <Badge key={tag} className="bg-rose-100 text-rose-800">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-rose-600 hover:text-rose-800"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleAddMemo} className="w-full bg-rose-500 hover:bg-rose-600">
                  Save Memo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {memos.length === 0 ? (
          <div className="text-center py-8">
            <Mic className="h-12 w-12 text-rose-300 mx-auto mb-4" />
            <p className="text-rose-600">No memos yet. Start capturing your thoughts and memories!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {memos.map((memo) => (
              <div key={memo.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{memo.title}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(memo.dateCreated).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{memo.content}</p>
                    {memo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {memo.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteMemo(memo.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceMemos;
