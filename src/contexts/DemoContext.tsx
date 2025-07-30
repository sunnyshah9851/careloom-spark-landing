import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DemoRelationship {
  id: string;
  name: string;
  relationship_type: string;
  email?: string;
  birthday?: string;
  anniversary?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

interface DemoContextType {
  isDemoMode: boolean;
  demoRelationships: DemoRelationship[];
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  addDemoRelationship: (relationship: Omit<DemoRelationship, 'id' | 'created_at'>) => void;
  removeDemoRelationship: (id: string) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};

const SAMPLE_RELATIONSHIPS: DemoRelationship[] = [
  {
    id: 'demo-1',
    name: 'Sarah',
    relationship_type: 'partner',
    email: 'sarah@example.com',
    birthday: '1990-06-15',
    anniversary: '2019-03-20',
    notes: 'Loves hiking and coffee shops. Always up for trying new restaurants.',
    tags: ['outdoor enthusiast', 'foodie'],
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'demo-2', 
    name: 'Mom',
    relationship_type: 'family',
    birthday: '1965-09-30',
    notes: 'Enjoys gardening and reading mystery novels. Lives about 2 hours away.',
    tags: ['book lover', 'gardener'],
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 'demo-3',
    name: 'Alex',
    relationship_type: 'friend',
    email: 'alex@example.com',
    birthday: '1988-12-03',
    notes: 'College roommate. Works in tech. Great at board games.',
    tags: ['gamer', 'tech'],
    created_at: '2024-02-01T09:15:00Z'
  }
];

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoRelationships, setDemoRelationships] = useState<DemoRelationship[]>(SAMPLE_RELATIONSHIPS);

  const enterDemoMode = () => {
    setIsDemoMode(true);
    setDemoRelationships(SAMPLE_RELATIONSHIPS);
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    setDemoRelationships([]);
  };

  const addDemoRelationship = (relationship: Omit<DemoRelationship, 'id' | 'created_at'>) => {
    const newRelationship: DemoRelationship = {
      ...relationship,
      id: `demo-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setDemoRelationships(prev => [...prev, newRelationship]);
  };

  const removeDemoRelationship = (id: string) => {
    setDemoRelationships(prev => prev.filter(rel => rel.id !== id));
  };

  return (
    <DemoContext.Provider value={{
      isDemoMode,
      demoRelationships,
      enterDemoMode,
      exitDemoMode,
      addDemoRelationship,
      removeDemoRelationship
    }}>
      {children}
    </DemoContext.Provider>
  );
};