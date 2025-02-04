import React from 'react';
import BathroomMap from './BathroomMap';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Bathroom Finder</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 h-[calc(100vh-4rem)]">
        <ErrorBoundary>
          <BathroomMap />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;