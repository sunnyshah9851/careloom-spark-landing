
import React from 'react';
import { TestBirthdayReminders } from '@/components/dashboard/TestBirthdayReminders';

const TestPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Birthday Reminder Testing</h1>
      <TestBirthdayReminders />
    </div>
  );
};

export default TestPage;
