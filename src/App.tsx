import React from 'react';
import BathroomMap from './BathroomMap';


function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Bathroom Finder</h1>
        </div>
      </header>

      <main className="flex-1 h-[calc(100vh-4rem)]">
        
          <BathroomMap />
        
      </main>
    </div>
  );
}

export default App;