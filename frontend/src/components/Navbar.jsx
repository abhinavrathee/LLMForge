import React from 'react';

const Navbar = () => {
  return (
    <header className="w-full p-4 flex items-center justify-between border-b border-brand-secondary sticky top-0 bg-brand-bg/80 backdrop-blur-sm z-20 shadow-sm">
      <div className="flex items-center space-x-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-brand-primary">LLMForge</h1>
      </div>
      <div>
        <span className="text-sm text-brand-text-secondary">AI Model Comparator</span>
      </div>
    </header>
  );
};

export default Navbar;
