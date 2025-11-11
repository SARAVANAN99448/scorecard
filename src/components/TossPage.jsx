import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw, ChevronRight } from 'lucide-react';

function TossPage() {
  const navigate = useNavigate();
  const matchSettingsData = localStorage.getItem('matchSettings');
  
  if (!matchSettingsData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-black text-black mb-4">⚠️ Error</h1>
          <p className="text-gray-600 text-lg mb-8">Match settings not found. Please create a match first.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition text-sm md:text-base border-2 border-green-700"
          >
            Create Match
          </button>
        </div>
      </div>
    );
  }

  const matchSettings = JSON.parse(matchSettingsData);

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedCall, setSelectedCall] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [tossResult, setTossResult] = useState(null);
  const [tossWinner, setTossWinner] = useState('');
  const [coinRotation, setCoinRotation] = useState(0);
  const [showBatBowlChoice, setShowBatBowlChoice] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState('');

  const handleTeamSelect = (team) => {
    if (!isFlipping) setSelectedTeam(team);
  };

  const handleCallSelect = (call) => {
    if (!isFlipping) setSelectedCall(call);
  };
  const flipCoin = () => {
    if (!selectedTeam || !selectedCall) {
      alert('Please select both team and call (Head/Tail)');
      return;
    }

    setIsFlipping(true);
    setTossResult(null);
    setTossWinner('');
    setShowBatBowlChoice(false);
    setSelectedChoice('');

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const flipDuration = 2000;
    const startTime = Date.now();
    const finalRotation = result === 'heads' ? 0 : 1080;

    let animationFrameId;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / flipDuration, 1); // Ensure progress never exceeds 1

      if (progress < 1) {
        const rotation = progress * finalRotation;
        setCoinRotation(rotation);
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setCoinRotation(finalRotation);
        setTossResult(result);

        const callMatches = (selectedCall === 'heads' && result === 'heads') || 
                           (selectedCall === 'tails' && result === 'tails');

        if (callMatches) {
          setTossWinner(selectedTeam);
        } else {
          const otherTeam = selectedTeam === matchSettings.teamA ? matchSettings.teamB : matchSettings.teamA;
          setTossWinner(otherTeam);
        }

        setShowBatBowlChoice(true);
        setIsFlipping(false);
      }
    };

    // Start animation
    animationFrameId = requestAnimationFrame(animate);

    // Fallback: Force completion if animation doesn't finish
    setTimeout(() => {
      if (isFlipping) {
        cancelAnimationFrame(animationFrameId);
        setCoinRotation(finalRotation);
        setTossResult(result);

        const callMatches = (selectedCall === 'heads' && result === 'heads') || 
                           (selectedCall === 'tails' && result === 'tails');

        if (callMatches) {
          setTossWinner(selectedTeam);
        } else {
          const otherTeam = selectedTeam === matchSettings.teamA ? matchSettings.teamB : matchSettings.teamA;
          setTossWinner(otherTeam);
        }

        setShowBatBowlChoice(true);
        setIsFlipping(false);
      }
    }, flipDuration + 500); // Extra 500ms buffer
  };

  const handleBatBowlChoice = (choice) => {
    setSelectedChoice(choice);
  };

  const handleContinue = () => {
    if (!tossWinner || !selectedChoice) {
      alert('Toss winner must choose to Bat or Bowl!');
      return;
    }

    let battingFirstTeam, bowlingFirstTeam;

    if (selectedChoice === 'bat') {
      battingFirstTeam = tossWinner;
      bowlingFirstTeam = tossWinner === matchSettings.teamA ? matchSettings.teamB : matchSettings.teamA;
    } else {
      bowlingFirstTeam = tossWinner;
      battingFirstTeam = tossWinner === matchSettings.teamA ? matchSettings.teamB : matchSettings.teamA;
    }

    const updatedSettings = {
      ...matchSettings,
      battingFirst: battingFirstTeam,
      bowlingFirst: bowlingFirstTeam,
      tossCaller: selectedTeam,
      tossResult: tossResult,
      tossWinner: tossWinner,
      tossChoice: selectedChoice
    };

    localStorage.setItem('matchSettings', JSON.stringify(updatedSettings));
    navigate('/scoring');
  };

  const handleReset = () => {
    setSelectedTeam('');
    setSelectedCall('');
    setTossResult(null);
    setTossWinner('');
    setCoinRotation(0);
    setShowBatBowlChoice(false);
    setSelectedChoice('');
  };

  return (
    <div className="min-h-screen bg-white p-2 md:p-4 py-6 px-5 md:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-black mb-2">🏏 Toss</h1>
          <p className="text-gray-600 text-sm md:text-base">{matchSettings.overs} Overs Match</p>
        </div>

        {/* Match Teams Info */}
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 mb-8 ">
          <div className="flex items-center justify-center gap-4">
            {/* Team A */}
            <div className="px-4 py-3 bg-white border-2 border-green-600 rounded-xl">
              <p className="text-black font-black text-lg md:text-2xl">{matchSettings.teamA}</p>
            </div>
            
            {/* VS */}
            <div className="text-2xl md:text-3xl font-black text-gray-700">VS</div>
            
            {/* Team B */}
            <div className="px-4 py-3 bg-white border-2 border-green-600 rounded-xl">
              <p className="text-black font-black text-lg md:text-2xl">{matchSettings.teamB}</p>
            </div>
          </div>
        </div>


        {/* 3D Coin Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32 md:w-40 md:h-40 perspective">
            <div
              className="w-full h-full rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-transform duration-100 border-4 font-black"
              style={{
                background: tossResult === 'tails' || (coinRotation % 360 >= 90 && coinRotation % 360 < 270 && !tossResult)
                  ? 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)'
                  : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                borderColor: '#16a34a',
                transform: `rotateY(${coinRotation}deg)`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              {tossResult === 'tails' ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="text-5xl md:text-6xl">🦁</div>
                  <div className="text-xs font-black text-gray-600 mt-2">TAILS</div>
                </div>
              ) : tossResult === 'heads' ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="text-5xl md:text-6xl text-yellow-600">₹</div>
                  <div className="text-xs font-black text-yellow-700 mt-2">HEADS</div>
                </div>
              ) : (
                coinRotation % 360 >= 90 && coinRotation % 360 < 270 ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-5xl md:text-6xl">🦁</div>
                    <div className="text-xs font-black text-gray-600 mt-2">TAILS</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-5xl md:text-6xl text-yellow-600">₹</div>
                    <div className="text-xs font-black text-yellow-700 mt-2">HEADS</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Coin State Display */}
        {tossResult && (
          <div className="text-center mb-8">
            <div className={`inline-block px-6 py-4 rounded-xl border-2 border-green-600 font-black text-lg md:text-2xl ${
              tossResult === 'heads'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {tossResult === 'heads' ? '₹ HEADS' : '🦁 TAILS'}
            </div>
          </div>
        )}

        {!showBatBowlChoice && (
          <>
            {/* Team Selection */}
            <div className="mb-8">
              <label className="block text-black font-black text-sm md:text-base mb-3 uppercase">
                Select Team to Call Toss
              </label>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[matchSettings.teamA, matchSettings.teamB].map((team) => (
                  <button
                    key={team}
                    onClick={() => handleTeamSelect(team)}
                    disabled={isFlipping}
                    className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition transform font-bold text-sm md:text-base ${
                      selectedTeam === team
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-green-400'
                    } ${isFlipping ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            {/* Call Selection */}
            <div className="mb-8">
              <label className="block text-black font-black text-sm md:text-base mb-3 uppercase">
                Pick Your Call
              </label>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={() => handleCallSelect('heads')}
                  disabled={isFlipping}
                  className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition transform font-bold text-sm md:text-base ${
                    selectedCall === 'heads'
                      ? 'border-green-600 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-green-400'
                  } ${isFlipping ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                >
                  <div className="text-3xl md:text-4xl mb-2">₹</div>
                  <div>HEADS</div>
                </button>
                <button
                  onClick={() => handleCallSelect('tails')}
                  disabled={isFlipping}
                  className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition transform font-bold text-sm md:text-base ${
                    selectedCall === 'tails'
                      ? 'border-green-600 bg-gray-50 text-gray-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-green-400'
                  } ${isFlipping ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                >
                  <div className="text-3xl md:text-4xl mb-2">🦁</div>
                  <div>TAILS</div>
                </button>
              </div>
            </div>

            {/* Flip Button */}
            <div className="mb-8">
              <button
                onClick={flipCoin}
                disabled={!selectedTeam || !selectedCall || isFlipping}
                className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg transition transform flex items-center justify-center gap-2 border-2 ${
                  !selectedTeam || !selectedCall || isFlipping
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 border-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700 active:scale-95 border-green-700'
                }`}
              >
                <Play className="w-5 h-5" />
                {isFlipping ? 'Flipping...' : 'Flip Coin'}
              </button>
            </div>
          </>
        )}

        {/* Bat/Bowl Choice Section */}
        {showBatBowlChoice && (
          <div className="space-y-6">
            {/* Toss Winner Info */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-green-600">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm md:text-base mb-2">🎉 Toss Won By</p>
                <p className="text-black font-black text-2xl md:text-3xl mb-4">{tossWinner}</p>
                <p className="text-gray-600 text-xs md:text-sm">
                  {selectedTeam} called {selectedCall === 'heads' ? '₹ HEADS' : '🦁 TAILS'} and got {tossResult === 'heads' ? '₹ HEADS' : '🦁 TAILS'}
                </p>
              </div>
            </div>

            {/* Bat/Bowl Choice */}
            <div>
              <label className="block text-black font-black text-sm md:text-base mb-3 uppercase">
                {tossWinner} - Choose to Bat or Bowl
              </label>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={() => handleBatBowlChoice('bat')}
                  disabled={isFlipping}
                  className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition transform font-bold text-sm md:text-base ${
                    selectedChoice === 'bat'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-green-400'
                  } ${isFlipping ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                >
                  <div className="text-3xl md:text-4xl mb-2">🏏</div>
                  <div>BAT FIRST</div>
                </button>

                <button
                  onClick={() => handleBatBowlChoice('bowl')}
                  disabled={isFlipping}
                  className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition transform font-bold text-sm md:text-base ${
                    selectedChoice === 'bowl'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-green-400'
                  } ${isFlipping ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                >
                  <div className="text-3xl md:text-4xl mb-2">⚾</div>
                  <div>BOWL FIRST</div>
                </button>
              </div>
            </div>

            {/* Decision Display */}
            {selectedChoice && (
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-green-600">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 text-center">
                    <p className="text-green-700 text-xs md:text-sm font-bold mb-2">🏏 BATTING FIRST</p>
                    <p className="text-black font-black text-lg md:text-xl">
                      {selectedChoice === 'bat' ? tossWinner : (tossWinner === matchSettings.teamA ? matchSettings.teamB : matchSettings.teamA)}
                    </p>
                  </div>

                  <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 text-center">
                    <p className="text-green-700 text-xs md:text-sm font-bold mb-2">⚾ BOWLING FIRST</p>
                    <p className="text-black font-black text-lg md:text-xl">
                      {selectedChoice === 'bowl' ? tossWinner : (tossWinner === matchSettings.teamA ? matchSettings.teamB : matchSettings.teamA)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={handleReset}
                disabled={isFlipping}
                className={`py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition transform text-sm md:text-base flex items-center justify-center gap-2 border-2 ${
                  isFlipping
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 border-gray-300'
                    : 'bg-white text-black border-green-600 hover:bg-gray-50 active:scale-95'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Re-Toss
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedChoice || isFlipping}
                className={`py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition transform text-sm md:text-base flex items-center justify-center gap-2 border-2 ${
                  !selectedChoice || isFlipping
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 border-gray-300'
                    : 'bg-green-600 text-white border-green-700 hover:bg-green-700 active:scale-95'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                Start Match
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @supports (transform: rotateY(0deg)) {
          .perspective {
            perspective: 1000px;
          }
        }
      `}</style>
    </div>
  );
}

export default TossPage;
