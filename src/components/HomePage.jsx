import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, History } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl md:text-7xl mb-4">🏏</div>
          <h1 className="text-4xl md:text-5xl font-black text-black mb-2">
            Arani bunnies
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Track your matches like a professional
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl  p-6 md:p-8 ">
          
          {/* Main Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/setup')}
              className="w-full bg-green-600 text-white py-4 md:py-5 rounded-lg font-black hover:bg-green-700 transition transform hover:scale-105 flex items-center justify-center gap-2 text-base md:text-lg shadow-lg border-2 border-green-700"
            >
              <Plus className="w-5 h-5" />
              New Match
            </button>

            <button
              onClick={() => navigate('/history')}
              className="w-full bg-white text-black py-4 md:py-5 rounded-lg font-black hover:bg-gray-50 transition transform hover:scale-105 flex items-center justify-center gap-2 text-base md:text-lg shadow-lg border-2 border-green-600"
            >
              <History className="w-5 h-5" />
              Match History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
