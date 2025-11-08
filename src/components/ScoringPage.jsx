import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ChevronRight, RotateCw, Undo2, Repeat2 } from 'lucide-react';
import BatsmanModal from './modals/BatsmanModal';
import BowlerModal from './modals/BowlerModal';
import WicketModal from './modals/WicketModal';
import ExtraRunsModal from './modals/ExtraRunsModal';

function ScoringPage() {
  const navigate = useNavigate();
  const matchSettings = JSON.parse(localStorage.getItem('matchSettings'));

  const [innings, setInnings] = useState(1);
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ballsCompleted, setBallsCompleted] = useState(0);

  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');
  const [ballHistory, setBallHistory] = useState([]);

  const [playerStats, setPlayerStats] = useState({});
  const [innings1Data, setInnings1Data] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showExtraRunsModal, setShowExtraRunsModal] = useState(false);
  const [newBatsmanNeeded, setNewBatsmanNeeded] = useState(false);
  const [pendingExtra, setPendingExtra] = useState(null);

  // CALCULATE THESE FIRST
  const totalBalls = matchSettings.overs * 6;
  const currentOver = Math.floor(ballsCompleted / 6);
  const ballInOver = ballsCompleted % 6;
  const oversDisplay = `${currentOver}.${ballInOver}`;

  // THEN declare the state that uses currentOver
  const [selectedOverIndex, setSelectedOverIndex] = useState(0); // Use 0 as initial, will update via useEffect

  const currentBattingTeam = innings === 1 ? matchSettings.battingFirst : matchSettings.bowlingFirst;
  const currentBowlingTeam = innings === 1 ? matchSettings.bowlingFirst : matchSettings.battingFirst;

  const isInningsComplete = wickets >= matchSettings.playersPerTeam - 1 || ballsCompleted >= totalBalls;

  // Add useEffect to sync selectedOverIndex with currentOver
  useEffect(() => {
    setSelectedOverIndex(currentOver);
  }, [currentOver]);

  // Load match state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('currentMatchState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setInnings(state.innings || 1);
        setScore(state.score || 0);
        setWickets(state.wickets || 0);
        setBallsCompleted(state.ballsCompleted || 0);
        setStriker(state.striker || '');
        setNonStriker(state.nonStriker || '');
        setBowler(state.bowler || '');
        setBallHistory(state.ballHistory || []);
        setPlayerStats(state.playerStats || {});
        setInnings1Data(state.innings1Data || null);
        setPendingExtra(state.pendingExtra || null);
      } catch (error) {
        console.error('Error loading match state:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Auto-save match state to localStorage
  useEffect(() => {
    if (isLoaded) {
      const matchState = {
        innings,
        score,
        wickets,
        ballsCompleted,
        striker,
        nonStriker,
        bowler,
        ballHistory,
        playerStats,
        innings1Data,
        pendingExtra
      };
      localStorage.setItem('currentMatchState', JSON.stringify(matchState));
    }
  }, [isLoaded, innings, score, wickets, ballsCompleted, striker, nonStriker, bowler, ballHistory, playerStats, innings1Data, pendingExtra]);

  useEffect(() => {
    if (innings === 2 && innings1Data && score > innings1Data.score) {
      const timer = setTimeout(() => {
        completeMatchWithWinner(currentBattingTeam, matchSettings.playersPerTeam - 1 - wickets, 'wickets');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [score, innings, innings1Data, currentBattingTeam, matchSettings.playersPerTeam]);

  useEffect(() => {
    if (isInningsComplete && innings === 2 && innings1Data) {
      const timer = setTimeout(() => {
        determineWinner();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInningsComplete, innings, innings1Data]);

  // Ask for opening batsmen only on fresh start (no saved state)
  useEffect(() => {
    if (isLoaded && ballsCompleted === 0 && !striker && !nonStriker && !showBatsmanModal) {
      setShowBatsmanModal(true);
    }
  }, [isLoaded, ballsCompleted, striker, nonStriker, showBatsmanModal]);

  // Ask for opening bowler only on fresh start
  useEffect(() => {
    if (isLoaded && ballsCompleted === 0 && striker && nonStriker && !bowler && !showBowlerModal) {
      setShowBowlerModal(true);
    }
  }, [isLoaded, ballsCompleted, striker, nonStriker, bowler, showBowlerModal]);

  const handleSwipeLeft = () => {
    if (selectedOverIndex < currentOver) {
      setSelectedOverIndex(selectedOverIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (selectedOverIndex > 0) {
      setSelectedOverIndex(selectedOverIndex - 1);
    }
  };

  const handleSwipe = (e) => {
    const touch = e.touches[0];
    const start = { x: touch.clientX, y: touch.clientY };

    const handleTouchEnd = (e) => {
      const end = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      const diff = end.x - start.x;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleSwipeRight(); // Swipe right = previous over
        } else {
          handleSwipeLeft(); // Swipe left = next over
        }
      }
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchend', handleTouchEnd);
  };


  const calculateStrikeRate = (runs, balls) => {
    if (balls === 0) return 0;
    return ((runs / balls) * 100).toFixed(2);
  };

  const calculateEconomy = (runs, balls) => {
    if (balls === 0) return 0;
    const overs = balls / 6;
    return (runs / overs).toFixed(2);
  };

  const updatePlayerStats = (playerName, type, value) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerName]: {
        ...prev[playerName],
        runs: type === 'runs' ? (prev[playerName]?.runs || 0) + value : (prev[playerName]?.runs || 0),
        wickets: type === 'wickets' ? (prev[playerName]?.wickets || 0) + value : (prev[playerName]?.wickets || 0),
        ballsFaced: type === 'ballsFaced' ? (prev[playerName]?.ballsFaced || 0) + value : (prev[playerName]?.ballsFaced || 0),
        ballsBowled: type === 'ballsBowled' ? (prev[playerName]?.ballsBowled || 0) + value : (prev[playerName]?.ballsBowled || 0),
        runsConceded: type === 'runsConceded' ? (prev[playerName]?.runsConceded || 0) + value : (prev[playerName]?.runsConceded || 0),
        team: type === 'runs' || type === 'ballsFaced' ? currentBattingTeam : currentBowlingTeam
      }
    }));
  };

  const handleOpeningBatsmen = (batsman1, batsman2) => {
    setStriker(batsman1);
    setNonStriker(batsman2);
    setShowBatsmanModal(false);
  };

  const handleBowlerSelected = (bowlerName) => {
    setBowler(bowlerName);
    setShowBowlerModal(false);
  };

  const handleRuns = (runs) => {
    if (!striker || !bowler) {
      alert('Please wait, setting up players...');
      return;
    }

    const newScore = score + runs;
    setScore(newScore);
    setBallsCompleted(ballsCompleted + 1);
    updatePlayerStats(striker, 'runs', runs);
    updatePlayerStats(striker, 'ballsFaced', 1);
    updatePlayerStats(bowler, 'ballsBowled', 1);
    updatePlayerStats(bowler, 'runsConceded', runs);

    // Count Fours and Sixes
    if (runs === 4) {
      setPlayerStats(prev => ({
        ...prev,
        [striker]: {
          ...prev[striker],
          fours: (prev[striker]?.fours || 0) + 1
        }
      }));
    } else if (runs === 6) {
      setPlayerStats(prev => ({
        ...prev,
        [striker]: {
          ...prev[striker],
          sixes: (prev[striker]?.sixes || 0) + 1
        }
      }));
    }

    const ballDetail = {
      ball: ballsCompleted + 1,
      over: currentOver,
      runs,
      strikerRuns: runs,
      strikerName: striker,
      bowlerName: bowler
    };
    setBallHistory(prev => [...prev, ballDetail]); // FIXED

    if (runs % 2 === 1) {
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }

    if ((ballsCompleted + 1) % 6 === 0 && (ballsCompleted + 1) < totalBalls) {
      setTimeout(() => {
        setShowBowlerModal(true);
      }, 500);
    }
  };

  const handleWide = () => {
    if (!bowler) {
      alert('Bowler not set');
      return;
    }
    const newScore = score + matchSettings.wideRuns;
    setScore(newScore);
    updatePlayerStats(bowler, 'runsConceded', matchSettings.wideRuns);

    const ballDetail = {
      ball: ballsCompleted,
      over: currentOver, // Store as NUMBER not string
      ballInOver: ballInOver,
      runs: matchSettings.wideRuns,
      strikerRuns: 0,
      strikerName: striker,
      bowlerName: bowler,
      type: 'wide',
      isFreeDelivery: true,
      displayText: 'WD'
    };
    setBallHistory(prev => [...prev, ballDetail]);
  };

  const handleNoBall = () => {
    if (!bowler) {
      alert('Bowler not set');
      return;
    }
    const newScore = score + matchSettings.noBallRuns;
    setScore(newScore);
    updatePlayerStats(bowler, 'runsConceded', matchSettings.noBallRuns);

    const ballDetail = {
      ball: ballsCompleted,
      over: currentOver, // Store as NUMBER not string
      ballInOver: ballInOver,
      runs: matchSettings.noBallRuns,
      strikerRuns: 0,
      strikerName: striker,
      bowlerName: bowler,
      type: 'noball',
      isFreeDelivery: true,
      displayText: 'NB'
    };
    setBallHistory(prev => [...prev, ballDetail]);
  };



  const handleExtraRunsSelection = (type) => {
    setPendingExtra(type);
    setShowExtraRunsModal(false);
  };

  const handleRunsWithExtra = (runs) => {
    if (!striker || !bowler) {
      alert('Please wait, setting up players...');
      return;
    }

    const extraRuns = pendingExtra === 'wide' ? matchSettings.wideRuns : matchSettings.noBallRuns;
    const totalRuns = extraRuns + runs;
    setScore(score + totalRuns);

    updatePlayerStats(bowler, 'runsConceded', totalRuns);

    if (runs > 0) {
      updatePlayerStats(striker, 'runs', runs);
      updatePlayerStats(striker, 'ballsFaced', 1);

      if (runs === 4) {
        setPlayerStats(prev => ({
          ...prev,
          [striker]: {
            ...prev[striker],
            fours: (prev[striker]?.fours || 0) + 1
          }
        }));
      } else if (runs === 6) {
        setPlayerStats(prev => ({
          ...prev,
          [striker]: {
            ...prev[striker],
            sixes: (prev[striker]?.sixes || 0) + 1
          }
        }));
      }
    }

    // FIXED: Create SEPARATE entries for Wide/NoB and Runs
    // First add the extra ball
    const extraBallDetail = {
      ball: ballsCompleted,
      over: currentOver,
      ballInOver: ballInOver,
      runs: extraRuns,
      strikerRuns: 0,
      strikerName: striker,
      bowlerName: bowler,
      type: pendingExtra,
      extraRuns: extraRuns,
      isFreeDelivery: true,
      displayText: pendingExtra === 'wide' ? 'WD' : 'NB'
    };
    setBallHistory(prev => [...prev, extraBallDetail]);

    // Then add the runs ball if runs > 0
    if (runs > 0) {
      const runsBallDetail = {
        ball: ballsCompleted + 1,
        over: currentOver,
        ballInOver: ballInOver,
        runs: runs,
        strikerRuns: runs,
        strikerName: striker,
        bowlerName: bowler,
        isFreeDelivery: false,
        displayText: runs
      };
      setBallHistory(prev => [...prev, runsBallDetail]);
      setBallsCompleted(ballsCompleted + 1);
    }

    if (runs % 2 === 1) {
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }

    setPendingExtra(null);
  };



  const handleWicketSubmit = (dismissalMode, details) => {
    if (!striker || !bowler) {
      alert('Striker or bowler not set');
      return;
    }

    let batterToRemove = striker;

    if (dismissalMode === 'runout' && details.selectedBatsman === 'nonstriker') {
      batterToRemove = nonStriker;
    }

    // Add extra runs for run-out
    let extraRunsToAdd = 0;
    if (dismissalMode === 'runout' && details.extraRuns !== null) {
      extraRunsToAdd = details.extraRuns;
      setScore(score + extraRunsToAdd);
      updatePlayerStats(bowler, 'runsConceded', extraRunsToAdd);
    }

    setWickets(wickets + 1);
    setBallsCompleted(ballsCompleted + 1);
    updatePlayerStats(bowler, 'wickets', 1);
    updatePlayerStats(batterToRemove, 'ballsFaced', 1);
    updatePlayerStats(bowler, 'ballsBowled', 1);

    const ballDetail = {
      ball: ballsCompleted + 1,
      over: currentOver,
      type: 'wicket',
      dismissalMode,
      details,
      batsmanName: batterToRemove,
      bowlerName: bowler,
      runs: extraRunsToAdd
    };
    setBallHistory(prev => [...prev, ballDetail]); // FIXED

    setShowWicketModal(false);

    if (dismissalMode === 'runout' && details.selectedBatsman === 'nonstriker') {
      setNonStriker('');
    } else {
      setStriker('');
    }

    setNewBatsmanNeeded(true);

    if ((ballsCompleted + 1) % 6 === 0 && (ballsCompleted + 1) < totalBalls) {
      setTimeout(() => {
        setShowBowlerModal(true);
      }, 1000);
    }
  };

  const handleNewBatsman = (newBatsman) => {
    setStriker(newBatsman);
    setNewBatsmanNeeded(false);
    setShowBatsmanModal(false);
  };

  const handleNextInnings = () => {
    setInnings1Data({
      team: currentBattingTeam,
      score,
      wickets,
      overs: oversDisplay
    });

    setInnings(2);
    setScore(0);
    setWickets(0);
    setBallsCompleted(0);
    setStriker('');
    setNonStriker('');
    setBowler('');
    setBallHistory([]);
    setPendingExtra(null);
    setShowBatsmanModal(true);
  };

  const undoLastBall = () => {
    if (ballHistory.length === 0) {
      alert('No balls to undo');
      return;
    }

    const lastBall = ballHistory[ballHistory.length - 1];

    setBallHistory(ballHistory.slice(0, -1));

    if (lastBall.type === 'wicket') {
      // FIXED: Undo run-out extra runs
      if (lastBall.runs && lastBall.runs > 0) {
        setScore(score - lastBall.runs);
        updatePlayerStats(lastBall.bowlerName, 'runsConceded', -lastBall.runs);
      }

      setWickets(wickets - 1);
      setBallsCompleted(ballsCompleted - 1);
      updatePlayerStats(lastBall.bowlerName, 'wickets', -1);

      if (lastBall.details?.selectedBatsman === 'nonstriker') {
        setNonStriker(lastBall.batsmanName);
      } else {
        setStriker(lastBall.batsmanName);
      }
      setNewBatsmanNeeded(false);
      updatePlayerStats(lastBall.bowlerName, 'ballsBowled', -1);
    } else if (lastBall.isFreeDelivery) {
      setScore(score - lastBall.runs);
      updatePlayerStats(lastBall.bowlerName, 'runsConceded', -lastBall.runs);

      if (lastBall.strikerRuns > 0) {
        updatePlayerStats(lastBall.strikerName, 'runs', -lastBall.strikerRuns);
        updatePlayerStats(lastBall.strikerName, 'ballsFaced', -1);

        if (lastBall.strikerRuns % 2 === 1) {
          const temp = striker;
          setStriker(nonStriker);
          setNonStriker(temp);
        }
      }
    } else {
      setScore(score - lastBall.runs);
      setBallsCompleted(ballsCompleted - 1);
      updatePlayerStats(lastBall.strikerName, 'runs', -lastBall.runs);
      updatePlayerStats(lastBall.strikerName, 'ballsFaced', -1);
      updatePlayerStats(lastBall.bowlerName, 'ballsBowled', -1);
      updatePlayerStats(lastBall.bowlerName, 'runsConceded', -lastBall.runs);

      if (lastBall.runs % 2 === 1) {
        const temp = striker;
        setStriker(nonStriker);
        setNonStriker(temp);
      }
    }

    setPendingExtra(null);
  };


  const calculateCapHolders = () => {
    const players = Object.entries(playerStats);

    const orangeCap = players.reduce((max, [name, stats]) =>
      (stats.runs || 0) > (max.runs || 0) ? { name, ...stats } : max
      , { name: 'N/A', runs: 0 });

    const purpleCap = players.reduce((max, [name, stats]) =>
      (stats.wickets || 0) > (max.wickets || 0) ? { name, ...stats } : max
      , { name: 'N/A', wickets: 0 });

    return { orangeCap, purpleCap };
  };

  const determineWinner = () => {
    let winner, winMargin, winType;

    if (score > innings1Data.score) {
      winner = currentBattingTeam;
      winMargin = matchSettings.playersPerTeam - 1 - wickets;
      winType = 'wickets';
    } else {
      winner = innings1Data.team;
      winMargin = innings1Data.score - score;
      winType = 'runs';
    }

    completeMatchWithWinner(winner, winMargin, winType);
  };

  const completeMatchWithWinner = async (winner, winMargin, winType) => {
    const { orangeCap, purpleCap } = calculateCapHolders();

    const matchData = {
      teamA: matchSettings.teamA,
      teamB: matchSettings.teamB,
      innings1: {
        battingTeam: innings1Data.team,
        score: innings1Data.score,
        wickets: innings1Data.wickets,
        overs: innings1Data.overs
      },
      innings2: {
        battingTeam: currentBattingTeam,
        score: score,
        wickets: wickets,
        overs: oversDisplay
      },
      winner: winner,
      winMargin: winMargin,
      winType: winType,
      matchSettings: matchSettings,
      playerStats: playerStats,
      ballHistory: ballHistory,
      orangeCap: orangeCap,
      purpleCap: purpleCap,
      createdAt: serverTimestamp(),
      timestamp: Date.now()
    };

    try {
      const docRef = await addDoc(collection(db, 'matches'), matchData);

      for (const [playerName, stats] of Object.entries(playerStats)) {
        const playerRef = doc(db, 'players', playerName);
        await setDoc(playerRef, {
          name: playerName,
          totalRuns: (stats.runs || 0),
          totalWickets: (stats.wickets || 0),
          matchesPlayed: 1,
          lastUpdated: serverTimestamp()
        }, { merge: true });
      }

      localStorage.removeItem('currentMatchState');

      alert('Match completed and saved!');
      navigate('/history');
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Failed to save match');
    }
  };


  const strikerStats = playerStats[striker] || { runs: 0, ballsFaced: 0 };
  const nonStrikerStats = playerStats[nonStriker] || { runs: 0, ballsFaced: 0 };
  const bowlerStats = playerStats[bowler] || { wickets: 0, ballsBowled: 0, runsConceded: 0 };


  return (
    <div className="min-h-screen bg-white px-3 md:p-4 py-3 md:py-6">
      <div className="max-w-5xl mx-auto space-y-3 md:space-y-4">

        {/* Main Score Card */}
        <div className= "sticky top-0 z-40 bg-white rounded-xl md:rounded-3xl shadow-2xl p-2 md:p-6 border-2 border-green-600">
          <div className="mb-2 md:mb-6">
            {/* Mobile: One Line Score */}
            <div className="md:hidden mb-2">
              <div className="flex items-center justify-between gap-1 p-2 bg-green-100 rounded-lg border border-green-600">
                <div className="text-center flex-1 min-w-0">
                  <p className="text-green-700 text-xs font-semibold truncate">{currentBattingTeam}</p>
                  <p className="text-black text-lg font-black">{score}/{wickets}</p>
                </div>
                <div className="text-center text-xs">
                  <p className="text-green-700 font-black">{oversDisplay}/{matchSettings.overs}</p>
                </div>
                <div className="text-center flex-1 min-w-0">
                  <p className="text-green-700 text-xs font-semibold truncate">{currentBowlingTeam}</p>
                  <p className="text-red-600 text-lg font-black">🏏</p>
                </div>
              </div>
            </div>

            {/* Desktop: Multi-line Layout */}
            <div className="hidden md:block">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-3 mb-2 md:mb-4">
                <div className="min-w-0">
                  <h1 className="text-lg md:text-4xl font-black text-black mb-0.5 md:mb-1 truncate">
                    Innings {innings}
                  </h1>
                  <p className="text-gray-600 text-xs md:text-base truncate">
                    {matchSettings.venue}
                  </p>
                </div>
                <div className="px-2 md:px-4 py-1 md:py-2 bg-green-600 rounded-full whitespace-nowrap border-2 border-green-700">
                  <p className="text-white font-bold text-xs md:text-sm">{matchSettings.overs} Overs</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 p-2 md:p-4 bg-green-50 rounded-lg md:rounded-2xl border-2 border-green-600">
                <div className="text-center flex-1 min-w-0">
                  <p className="text-green-700 text-xs md:text-sm font-semibold mb-0.5 md:mb-1">Batting</p>
                  <p className="text-sm md:text-2xl font-black text-green-700 truncate">{currentBattingTeam}</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl md:text-5xl font-black text-black mb-0.5 md:mb-2">
                    {score}/<span className="text-red-600">{wickets}</span>
                  </div>
                  <div className="text-gray-600 text-xs md:text-base font-semibold">
                    <span className="text-green-700 font-black">{oversDisplay}</span>/{matchSettings.overs}
                  </div>
                </div>

                <div className="text-center flex-1 min-w-0">
                  <p className="text-green-700 text-xs md:text-sm font-semibold mb-0.5 md:mb-1">Bowling</p>
                  <p className="text-sm md:text-2xl font-black text-red-600 truncate">{currentBowlingTeam}</p>
                </div>
              </div>
            </div>
          </div>

          <div className='mb-3 flex justify-center'>
            <button
              onClick={() => navigate('/scorecard')}
              title="View full scorecard"
              className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm bg-green-600 text-white hover:bg-green-700 transition transform hover:scale-105 active:scale-95 border-2 border-green-700"
            >
              live Scorecard
              <span className="hidden md:inline">View Scorecard</span>
            </button>
          </div>

          {innings === 2 && innings1Data && (
            <div className={`mb-2 md:mb-3 p-3 md:p-4 rounded-lg text-xs md:text-base border-2 ${score > innings1Data.score
              ? 'bg-green-100 border-green-600 text-green-700'
              : 'bg-yellow-100 border-yellow-600 text-yellow-700'
              }`}>
              {score > innings1Data.score ? (
                <p className="text-center font-semibold">
                  🎉 WINS! By {matchSettings.playersPerTeam - 1 - wickets}W
                </p>
              ) : (
                <p className="text-center font-semibold text-sm md:text-base">
                  {Math.max(0, innings1Data.score - score + 1)} runs needed from {Math.max(0, totalBalls - ballsCompleted)} balls
                </p>
              )}
            </div>
          )}
        </div>

        {/* Batsmen & Bowler */}
        <div className="md:hidden space-y-2">
          {/* Striker */}
          <div className="bg-white rounded-lg p-2 border-2 border-green-600 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-green-700 text-xs font-black uppercase mb-0.5">⚔️</p>
                <p className="text-black text-sm font-black truncate">{striker || 'Awaiting...'}</p>
              </div>
              {striker && (
                <div className="flex gap-2 text-xs text-center">
                  <div>
                    <p className="text-green-700 font-bold">R</p>
                    <p className="text-black font-black">{strikerStats.runs}</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-bold">B</p>
                    <p className="text-black font-black">{strikerStats.ballsFaced}</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-bold">SR</p>
                    <p className="text-black font-black text-xs">{calculateStrikeRate(strikerStats.runs, strikerStats.ballsFaced)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Non-Striker */}
          <div className="bg-white rounded-lg p-2 border-2 border-green-600 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-green-700 text-xs font-black uppercase mb-0.5">🤝</p>
                <p className="text-black text-sm font-black truncate">{nonStriker || 'Awaiting...'}</p>
              </div>
              {nonStriker && (
                <div className="flex gap-2 text-xs text-center">
                  <div>
                    <p className="text-green-700 font-bold">R</p>
                    <p className="text-black font-black">{nonStrikerStats.runs}</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-bold">B</p>
                    <p className="text-black font-black">{nonStrikerStats.ballsFaced}</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-bold">SR</p>
                    <p className="text-black font-black text-xs">{calculateStrikeRate(nonStrikerStats.runs, nonStrikerStats.ballsFaced)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bowler */}
          <div className="bg-white rounded-lg p-2 border-2 border-green-600 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-green-700 text-xs font-black uppercase mb-0.5">💨</p>
                <p className="text-black text-sm font-black truncate">{bowler || 'Setting up...'}</p>
              </div>
              {bowler && (
                <div className="flex gap-2 text-xs text-center">
                  <div>
                    <p className="text-green-700 font-bold">R</p>
                    <p className="text-black font-black">{bowlerStats.runsConceded}</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-bold">W</p>
                    <p className=" font-black text-red-600">{bowlerStats.wickets}</p>
                  </div>
                  <div>
                    <p className="text-green-700 font-bold">EC</p>
                    <p className="text-black font-black text-xs">{calculateEconomy(bowlerStats.runsConceded, bowlerStats.ballsBowled)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border-2 border-green-600 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-700 text-xs font-black uppercase">⚔️ Strike</p>
              <span className="px-1.5 py-0.5 bg-green-100 rounded text-green-700 text-xs font-bold border border-green-600">S</span>
            </div>
            <p className="text-black text-base md:text-2xl font-black mb-2 truncate">{striker || 'Awaiting...'}</p>
            {striker && (
              <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                <div className="text-center">
                  <p className="text-green-700 font-bold">R</p>
                  <p className="text-black font-black">{strikerStats.runs}</p>
                </div>
                <div className="text-center">
                  <p className="text-green-700 font-bold">B</p>
                  <p className="text-black font-black">{strikerStats.ballsFaced}</p>
                </div>
                <div className="text-center">
                  <p className="text-green-700 font-bold">SR</p>
                  <p className="text-black font-black text-xs">{calculateStrikeRate(strikerStats.runs, strikerStats.ballsFaced)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border-2 border-green-600 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-700 text-xs font-black uppercase">🤝 Other</p>
              <span className="px-1.5 py-0.5 bg-green-100 rounded text-green-700 text-xs font-bold border border-green-600">NS</span>
            </div>
            <p className="text-black text-base md:text-2xl font-black mb-2 truncate">{nonStriker || 'Awaiting...'}</p>
            {nonStriker && (
              <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                <div className="text-center">
                  <p className="text-green-700 font-bold">R</p>
                  <p className="text-black font-black">{nonStrikerStats.runs}</p>
                </div>
                <div className="text-center">
                  <p className="text-green-700 font-bold">B</p>
                  <p className="text-black font-black">{nonStrikerStats.ballsFaced}</p>
                </div>
                <div className="text-center">
                  <p className="text-green-700 font-bold">SR</p>
                  <p className="text-black font-black text-xs">{calculateStrikeRate(nonStrikerStats.runs, nonStrikerStats.ballsFaced)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Over Display */}
        {/* Previous Overs Slider */}
        {ballHistory.length > 0 && (
          <div 
            className="bg-white rounded-xl md:rounded-3xl shadow-2xl p-3 md:p-6 border-2 border-green-600 mb-4 md:mb-6"
            onTouchStart={handleSwipe}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div>
                <h3 className="text-base md:text-xl font-black text-black">
                  Over {selectedOverIndex === 0 ? 1 : selectedOverIndex + 1}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {selectedOverIndex === currentOver ? '📍 Current Over' : '⏮️ Previous Over'}
                </p>
              </div>
                           <div className="text-right">
                <p className="text-gray-600 text-xs font-bold">BOWLER</p>
                <p className="text-green-700 font-black text-sm md:text-base">
                  {(() => {
                    // Get the bowler for the selected over
                    const overBalls = ballHistory.filter(ball => ball.over === selectedOverIndex);
                    if (overBalls.length > 0) {
                      return overBalls[0].bowlerName || 'N/A';
                    }
                    return bowler || 'Select Bowler';
                  })()}
                </p>
              </div>

            </div>

            {/* Balls Display */}
            <div className="flex flex-wrap gap-1 md:gap-2 items-center">
              {(() => {
                const overBalls = ballHistory.filter(ball => ball.over === selectedOverIndex);

                if (overBalls.length === 0) {
                  return (
                    <div className="w-full text-center py-3 text-gray-500 text-sm">
                      Start of over
                    </div>
                  );
                }

                return overBalls.map((ball, idx) => {
                  const displayText = ball.displayText || (ball.type === 'wicket' ? 'W' : ball.runs);

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-center font-black transition ${
                        ball.type === 'wicket'
                          ? 'md:w-14 md:h-14 w-8 h-8 md:text-lg text-[10px]  border-2 border-red-600 text-red-700 rounded-full'
                          : ball.isFreeDelivery
                          ? 'md:w-16 md:h-16 w-8 h-8 md:text-xl text-[10px]  border-2 border-orange-600 text-orange-700 rounded-full'
                          : ball.runs === 6
                          ? 'md:w-12 md:h-12 w-8 h-8 md:text-base text-[10px]  text-amber-500 border-2 border-green-700 rounded-full'
                          : ball.runs === 4
                          ? 'md:w-12 md:h-12 w-8 h-8 md:text-base text-[10px]  border-2 border-green-700 text-amber-500  rounded-full'
                          : ball.runs === 0
                          ? 'md:w-12 md:h-12 w-8 h-8 md:text-base text-[10px] border-2 border-green-700 text-black rounded-full'
                          : 'md:w-12 md:h-12 w-8 h-8 md:text-base text-[10px]  border-2 border-green-700 text-black rounded-full'
                      }`}
                      title={`${ball.strikerName}: ${displayText}`}
                    >
                      {displayText}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Navigation Buttons - Display 1+ but use 0-based internally */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-gray-200">
              <button
                onClick={handleSwipeRight}
                disabled={selectedOverIndex === 0}
                className="px-2 w-7 h-8 md:px-4 py-1 md:py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg font-bold text-sm md:text-base transition"
              >
                ← 
              </button>

              {/* Show over numbers from 1 to current, but use 0-based internally */}
              <div className="flex gap-1 md:gap-2 overflow-x-auto px-2">
                {Array.from({ length: currentOver + 1 }, (_, i) => i).map(overIndex => (
                  <button
                    key={overIndex}
                    onClick={() => setSelectedOverIndex(overIndex)}
                    className={`px-2 md:px-3 py-1 md:py-2 rounded-lg font-black text-xs md:text-sm transition ${
                      selectedOverIndex === overIndex
                        ? 'bg-green-600 text-white border-2 border-green-700'
                        : 'bg-gray-200 text-black hover:bg-gray-300 border-2 border-gray-400'
                    }`}
                  >
                    {overIndex + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSwipeLeft}
                disabled={selectedOverIndex === currentOver}
                className="px-2 w-7 h-8 md:px-4 py-1 md:py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg font-bold text-sm md:text-base transition"
              >
                 →
              </button>
            </div>

            {/* Swipe Hint */}
            <p className="text-xs text-gray-500 text-center mt-2">💫 Swipe or click buttons to navigate</p>
          </div>
        )}



        {/* Scoring Interface */}
        <div className="bg-white rounded-xl md:rounded-3xl shadow-2xl p-3 md:p-6 border-2 border-green-600">
          <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
            <h3 className="text-base md:text-2xl font-black text-black">🎯 Runs</h3>
            <div className="flex gap-2">
              {/* Undo Button */}
              {ballHistory.length > 0 && (
                <button
                  onClick={undoLastBall}
                  disabled={isInningsComplete}
                  title="Undo last ball"
                  className={`flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition transform border-2 ${isInningsComplete
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 border-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 active:scale-95 border-red-700'
                    }`}
                >
                  <Undo2 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Undo</span>
                </button>
              )}

              {/* Switch Batsman Button */}
              {striker && nonStriker && (
                <button
                  onClick={() => {
                    const temp = striker;
                    setStriker(nonStriker);
                    setNonStriker(temp);
                  }}
                  title="Switch striker and non-striker"
                  className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm bg-green-600 text-white hover:bg-green-700 transition transform hover:scale-105 active:scale-95 border-2 border-green-700"
                >
                  <Repeat2 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Switch</span>
                </button>
              )}
            </div>
          </div>

          {/* Runs Grid */}
          <div className="grid grid-cols-4 gap-2 md:gap-3 mb-3 md:mb-4">
            {[0, 1, 2, 3, 4, 5, 6].map((run) => (
              <button
                key={run}
                onClick={() => pendingExtra ? handleRunsWithExtra(run) : handleRuns(run)}
                disabled={isInningsComplete}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full font-black text-sm md:text-base transition transform hover:scale-110 flex items-center justify-center ${run === 4 ? 'border-2 border-orange-600 text-black hover:bg-blue-50'
                  : run === 6 ? 'border-2 border-blue-600 text-black hover:bg-red-50'
                    : 'border border-black text-black hover:bg-green-50'
                  } ${isInningsComplete ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {run}
              </button>
            ))}

            <button
              onClick={() => setShowWicketModal(true)}
              disabled={isInningsComplete}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full font-black text-sm md:text-base transition transform hover:scale-110 flex items-center justify-center border-2 border-red-600 text-red-600 hover:bg-red-50 ${isInningsComplete ? 'opacity-40 cursor-not-allowed' : ''
                }`}
            >
              W
            </button>
          </div>

          {/* Pending Extra Indicator */}
          {pendingExtra && (
            <div className="mb-3 p-2 md:p-4 bg-yellow-100 border-2 border-yellow-600 rounded-lg text-center">
              <p className="text-yellow-700 font-black text-xs md:text-lg">
                {pendingExtra === 'wide' ? '📍 Wide' : '⚡ No Ball'} - Click run!
              </p>
            </div>
          )}

          {/* Extra Runs Buttons */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <button
              onClick={() => setShowExtraRunsModal(true)}
              disabled={isInningsComplete || pendingExtra}
              className={`py-2 md:py-5 rounded-lg md:rounded-xl font-black text-base md:text-xl transition transform hover:scale-105 flex items-center justify-center gap-1 border-2 ${isInningsComplete || pendingExtra
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 border-gray-300'
                : 'bg-purple-600 text-white hover:bg-purple-700 border-purple-700'
                }`}
            >
              <span className="text-xl md:text-2xl">➕</span>
            </button>

            <button
              onClick={handleWide}
              disabled={isInningsComplete}
              className={`py-2 md:py-5 rounded-lg md:rounded-xl font-bold text-xs md:text-base text-white transition transform hover:scale-105 border-2 ${isInningsComplete ? 'bg-gray-400 opacity-40 cursor-not-allowed border-gray-600'
                : 'bg-orange-600 hover:bg-orange-700 border-orange-700'
                }`}
            >
              wide
            </button>

            <button
              onClick={handleNoBall}
              disabled={isInningsComplete}
              className={`py-2 md:py-5 rounded-lg md:rounded-xl font-bold text-xs md:text-base text-white transition transform hover:scale-105 border-2 ${isInningsComplete ? 'bg-gray-400 opacity-40 cursor-not-allowed border-gray-600'
                : 'bg-yellow-600 hover:bg-yellow-700 border-yellow-700'
                }`}
            >
              no ball
            </button>
          </div>
        </div>

        {/* Innings Complete */}
        {isInningsComplete && (
          <div className="bg-white rounded-xl md:rounded-3xl shadow-2xl p-3 md:p-6 border-2 border-green-600">
            <div className="text-center mb-4 md:mb-6">
              <h3 className="text-xl md:text-4xl font-black text-black mb-1 md:mb-2">
                🏁 Innings {innings}!
              </h3>
              <p className="text-gray-600 text-xs md:text-lg">
                {currentBattingTeam}: <span className="text-green-700 font-black">{score}</span>/<span className="text-red-600 font-black">{wickets}</span> ({oversDisplay})
              </p>
            </div>

            {innings === 1 ? (
              <button
                onClick={handleNextInnings}
                className="w-full bg-green-600 text-white py-3 md:py-4 rounded-lg md:rounded-xl font-black hover:bg-green-700 transition text-sm md:text-base flex items-center justify-center gap-2 border-2 border-green-700"
              >
                <RotateCw className="w-4 h-4 md:w-5 md:h-5" />
                Innings 2
              </button>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {innings1Data && (
                  <div className="p-3 md:p-4 bg-green-100 border-2 border-green-600 rounded-lg text-center">
                    <p className="text-green-700 font-bold text-xs md:text-base">
                      {score > innings1Data.score
                        ? `🎉 ${currentBattingTeam} wins by ${matchSettings.playersPerTeam - 1 - wickets} wickets!`
                        : `🎉 ${innings1Data.team} wins by ${innings1Data.score - score} runs!`}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => determineWinner()}
                  className="w-full bg-green-600 text-white py-3 md:py-4 rounded-lg md:rounded-xl font-black hover:bg-green-700 transition text-sm md:text-base flex items-center justify-center gap-2 border-2 border-green-700"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  Complete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <BatsmanModal
        isOpen={showBatsmanModal && !newBatsmanNeeded}
        onClose={() => setShowBatsmanModal(false)}
        onSubmit={handleOpeningBatsmen}
        isOpening={ballsCompleted === 0}
      />

      <BatsmanModal
        isOpen={newBatsmanNeeded}
        onClose={() => setNewBatsmanNeeded(false)}
        onSubmit={(batsman1) => handleNewBatsman(batsman1)}
        isOpening={false}
        isSingleBatsman={true}
      />

      <BowlerModal
        isOpen={showBowlerModal}
        onClose={() => setShowBowlerModal(false)}
        onSubmit={handleBowlerSelected}
        overNumber={currentOver}
        isFirstOver={ballsCompleted === 0}
      />

      <WicketModal
        isOpen={showWicketModal}
        onClose={() => setShowWicketModal(false)}
        onSubmit={handleWicketSubmit}
        battingTeam={currentBattingTeam}
        bowler={bowler}
        striker={striker}
        nonStriker={nonStriker}
      />

      <ExtraRunsModal
        isOpen={showExtraRunsModal}
        onClose={() => setShowExtraRunsModal(false)}
        onSubmit={handleExtraRunsSelection}
        wideRuns={matchSettings.wideRuns}
        noBallRuns={matchSettings.noBallRuns}
      />





    </div>
  );
}

export default ScoringPage;
