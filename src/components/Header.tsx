
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CareloomLogo from './CareloomLogo';

const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <CareloomLogo />
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-rose-700 hover:text-rose-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-rose-700 hover:text-rose-900 transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-rose-700 hover:text-rose-900 transition-colors">
              Pricing
            </a>
          </nav>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-rose-700 hover:text-rose-900 hover:bg-rose-50"
            >
              Log In
            </Button>
            <Button 
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 border-0"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
