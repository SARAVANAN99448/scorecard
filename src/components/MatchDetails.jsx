import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Trophy } from 'lucide-react';

function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      const matchDoc = await getDoc(doc(db, 'matches', matchId));
      const currentMatch = { id: matchDoc.id, ...matchDoc.data() };
      console.log('Match data:', currentMatch);
      setMatch(currentMatch);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching match details:', error);
      setLoading(false);
    }
  };

  const calculateStats = (stats) => {
    if (!stats) return { strikeRate: 0, economy: 0 };
    
    const strikeRate = stats.ballsFaced ? ((stats.runs / stats.ballsFaced) * 100).toFixed(2) : '0.00';
    const economy = stats.ballsBowled ? (stats.runsConceded / (stats.ballsBowled / 6)).toFixed(2) : '0.00';
    
    return { strikeRate, economy };
  };

  const getDismissalInfo = (playerName, ballHistory) => {
    if (!ballHistory || ballHistory.length === 0) {
      return 'not out';
    }

    const wicketBall = ballHistory.find(
      ball => (ball.type === 'wicket' || ball.type === 'retired') && ball.batsmanName === playerName
    );

    if (!wicketBall) return 'not out';

    const mode = wicketBall.dismissalMode;
    const bowler = wicketBall.bowlerName || '';
    
    switch(mode) {
      case 'bowled':
        return `b ${bowler}`;
      
      case 'caught':
        const caughtFielder = wicketBall.details?.fielder;
        return caughtFielder ? `c ${caughtFielder} b ${bowler}` : `c b ${bowler}`;
      
      case 'lbw':
        return `lbw b ${bowler}`;
      
      case 'stumped':
        const stumpedFielder = wicketBall.details?.fielder;
        return stumpedFielder ? `st ${stumpedFielder} b ${bowler}` : `st b ${bowler}`;
      
      case 'runout':
        const runoutRuns = wicketBall.details?.extraRuns;
        return runoutRuns !== null && runoutRuns !== undefined ? `run out (${runoutRuns})` : 'run out';
      
      case 'hitwicket':
        return `hit wicket b ${bowler}`;
      
      case 'retiredout':
        return 'retired out';
      
      default:
        return 'not out';
    }
  };

  const getBattingByTeam = (team, ballHistory) => {
    const batting = [];
    Object.entries(match.playerStats || {}).forEach(([playerName, stats]) => {
      if (stats.team === team && stats.ballsFaced !== undefined && stats.ballsFaced > 0) {
        const { strikeRate } = calculateStats(stats);
        const dismissal = getDismissalInfo(playerName, ballHistory);
        
        batting.push({
          name: playerName,
          team: stats.team,
          runs: stats.runs || 0,
          balls: stats.ballsFaced,
          fours: stats.fours || 0,
          sixes: stats.sixes || 0,
          strikeRate: strikeRate,
          dismissal: dismissal
        });
      }
    });
    return batting;
  };

  const getBowlingByTeam = (team, ballHistory) => {
    const bowling = [];
    
    console.log('Getting bowling for team:', team);
    console.log('Ball history for counting wides:', ballHistory);
    
    Object.entries(match.playerStats || {}).forEach(([playerName, stats]) => {
      if (stats.team === team && stats.ballsBowled !== undefined && stats.ballsBowled > 0) {
        const { economy } = calculateStats(stats);
        const overs = Math.floor(stats.ballsBowled / 6);
        const balls = stats.ballsBowled % 6;
        
        // Debug: Check all balls for this bowler
        const allBallsByBowler = ballHistory?.filter(ball => ball.bowlerName === playerName);
        console.log(`All balls by ${playerName}:`, allBallsByBowler?.length);
        
        const wideBalls = ballHistory?.filter(ball => 
          ball.bowlerName === playerName && 
          ball.isFreeDelivery && 
          ball.extraType === 'wide'
        );
        console.log(`Wide balls by ${playerName}:`, wideBalls);
        
        const wides = wideBalls?.length || 0;
        
        bowling.push({
          name: playerName,
          team: stats.team,
          overs: `${overs}.${balls}`,
          maidens: 0,
          runs: stats.runsConceded || 0,
          wickets: stats.wickets || 0,
          economy: economy,
          wides: wides
        });
      }
    });
    return bowling;
  };


  const getExtras = (ballHistory) => {
    const extras = {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      penalties: 0,
      total: 0
    };

    if (!ballHistory) return extras;

    ballHistory.forEach(ball => {
      if (ball.isFreeDelivery) {
        if (ball.extraType === 'wide') extras.wides++;
        if (ball.extraType === 'noball') extras.noBalls++;
      }
    });

    extras.total = extras.wides + extras.noBalls + extras.byes + extras.legByes + extras.penalties;
    return extras;
  };

  const getFallOfWickets = (ballHistory) => {
    const wickets = [];
    let currentScore = 0;

    if (!ballHistory) return wickets;

    ballHistory.forEach(ball => {
      if (!ball.isFreeDelivery) {
        currentScore += ball.runs || 0;
      }

      if ((ball.type === 'wicket' || ball.type === 'retired') && ball.dismissalMode !== 'retiredout') {
        const overNum = ball.over + 1;
        const ballNum = ball.ballInOver;
        wickets.push({
          batsman: ball.batsmanName,
          score: `${currentScore}/${wickets.length + 1}`,
          over: `${overNum}.${ballNum}`
        });
      }
    });

    return wickets;
  };

  if (loading || !match) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading match details...</p>
        </div>
      </div>
    );
  }

  const innings1Batting = match.innings1?.battingTeam || match.teamA;
  const innings2Batting = match.innings2?.battingTeam || match.teamB;

  const innings1BallHistory = match.innings1?.ballHistory || [];
  const innings2BallHistory = match.innings2?.ballHistory || [];

  const innings1BattingStats = getBattingByTeam(innings1Batting, innings1BallHistory);
  const innings2BattingStats = getBattingByTeam(innings2Batting, innings2BallHistory);
  
  const teamABowling = getBowlingByTeam(match.teamA, [...innings1BallHistory, ...innings2BallHistory]);
  const teamBBowling = getBowlingByTeam(match.teamB, [...innings1BallHistory, ...innings2BallHistory]);

  const innings1Extras = getExtras(innings1BallHistory);
  const innings2Extras = getExtras(innings2BallHistory);

  const innings1Wickets = getFallOfWickets(innings1BallHistory);
  const innings2Wickets = getFallOfWickets(innings2BallHistory);

  return (
    <div className="min-h-screen bg-white p-2 md:p-4 py-4 md:py-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/history')}
          className="mb-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-semibold text-sm md:text-base border-2 border-green-600"
        >
          <ArrowLeft className="w-4 md:w-5 h-4 md:h-5" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6 border-2 border-green-600 text-center">
          <h1 className="text-2xl md:text-4xl font-black text-black mb-3">
            {match.teamA} v/s {match.teamB}
          </h1>
          <div className="inline-block px-6 py-3 bg-green-600 rounded-lg shadow-lg border-2 border-green-700">
            <span className="text-white font-black text-base md:text-lg">
              {match.winner} won by {match.winMargin} {match.winType}
            </span>
          </div>
        </div>

        {/* Innings 1 */}
        <div className="mb-8">
          <div className="bg-green-700 text-white px-4 py-2 rounded-t-xl font-black text-lg">
            {innings1Batting}
          </div>

          <div className="bg-white border-2 border-green-600 p-4 overflow-x-auto">
            <h3 className="font-black text-black mb-3">Batsman</h3>
            <div className="min-w-full">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-600 mb-2 pb-2 border-b-2">
                <div className="col-span-5">Batsman</div>
                <div className="col-span-1 text-center">R</div>
                <div className="col-span-1 text-center">B</div>
                <div className="col-span-1 text-center">4s</div>
                <div className="col-span-1 text-center">6s</div>
                <div className="col-span-3 text-right">SR</div>
              </div>

              {innings1BattingStats.map((stat) => (
                <div key={stat.name} className="grid grid-cols-12 gap-2 py-2 text-xs border-b hover:bg-gray-50">
                  <div className="col-span-5">
                    <p className="font-bold text-black">{stat.name}</p>
                    <p className={`text-xs italic ${
                      stat.dismissal === 'not out' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {stat.dismissal}
                    </p>
                  </div>
                  <div className="col-span-1 text-center font-bold">{stat.runs}</div>
                  <div className="col-span-1 text-center">{stat.balls}</div>
                  <div className="col-span-1 text-center">{stat.fours}</div>
                  <div className="col-span-1 text-center">{stat.sixes}</div>
                  <div className="col-span-3 text-right font-bold">{stat.strikeRate}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 py-2 border-t-2">
              <p className="text-sm">
                <span className="font-bold">Extras</span>
                <span className="ml-4 text-gray-600">
                  ({innings1Extras.total} 0 B, 0 LB, {innings1Extras.wides} WD, 0 NB, 0 P)
                </span>
              </p>
            </div>

            <div className="py-2 border-t-2">
              <p className="font-black text-lg">
                Total: {match.innings1.score}-{match.innings1.wickets} ({match.innings1.overs}) {match.matchSettings.overs}.0
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-t-0 border-green-600 p-4 overflow-x-auto">
            <h3 className="font-black text-black mb-3">Bowler</h3>
            <div className="min-w-full">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-600 mb-2 pb-2 border-b-2">
                <div className="col-span-4">Bowler</div>
                <div className="col-span-1 text-center">O</div>
                <div className="col-span-1 text-center">M</div>
                <div className="col-span-2 text-center">R</div>
                <div className="col-span-1 text-center">W</div>
                <div className="col-span-2 text-center">WD</div>
                <div className="col-span-1 text-right">ER</div>
              </div>

              {(innings1Batting === match.teamA ? teamBBowling : teamABowling).map((stat) => (
                <div key={stat.name} className="grid grid-cols-12 gap-2 py-2 text-xs border-b hover:bg-gray-50">
                  <div className="col-span-4 font-bold text-black">{stat.name}</div>
                  <div className="col-span-1 text-center">{stat.overs}</div>
                  <div className="col-span-1 text-center">{stat.maidens}</div>
                  <div className="col-span-2 text-center font-bold">{stat.runs}</div>
                  <div className="col-span-1 text-center font-bold text-red-600">{stat.wickets}</div>
                  <div className="col-span-2 text-center font-bold text-orange-600">{stat.wides}</div>
                  <div className="col-span-1 text-right font-bold">{stat.economy}</div>
                </div>
              ))}
            </div>
          </div>

          {innings1Wickets.length > 0 && (
            <div className="bg-white border-2 border-t-0 border-green-600 rounded-b-xl p-4">
              <h3 className="font-black text-black mb-3">Fall of wickets</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {innings1Wickets.map((wicket, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-bold">{wicket.batsman}</span>
                    <span className="ml-2 text-gray-600">{wicket.score}</span>
                    <span className="ml-2 text-gray-500">{wicket.over}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Innings 2 */}
        <div className="mb-8">
          <div className="bg-green-700 text-white px-4 py-2 rounded-t-xl font-black text-lg">
            {innings2Batting}
          </div>

          <div className="bg-white border-2 border-green-600 p-4 overflow-x-auto">
            <h3 className="font-black text-black mb-3">Batsman</h3>
            <div className="min-w-full">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-600 mb-2 pb-2 border-b-2">
                <div className="col-span-5">Batsman</div>
                <div className="col-span-1 text-center">R</div>
                <div className="col-span-1 text-center">B</div>
                <div className="col-span-1 text-center">4s</div>
                <div className="col-span-1 text-center">6s</div>
                <div className="col-span-3 text-right">SR</div>
              </div>

              {innings2BattingStats.map((stat) => (
                <div key={stat.name} className="grid grid-cols-12 gap-2 py-2 text-xs border-b hover:bg-gray-50">
                  <div className="col-span-5">
                    <p className="font-bold text-black">{stat.name}</p>
                    <p className={`text-xs italic ${
                      stat.dismissal === 'not out' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {stat.dismissal}
                    </p>
                  </div>
                  <div className="col-span-1 text-center font-bold">{stat.runs}</div>
                  <div className="col-span-1 text-center">{stat.balls}</div>
                  <div className="col-span-1 text-center">{stat.fours}</div>
                  <div className="col-span-1 text-center">{stat.sixes}</div>
                  <div className="col-span-3 text-right font-bold">{stat.strikeRate}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 py-2 border-t-2">
              <p className="text-sm">
                <span className="font-bold">Extras</span>
                <span className="ml-4 text-gray-600">
                  ({innings2Extras.total} 0 B, 0 LB, {innings2Extras.wides} WD, 0 NB, 0 P)
                </span>
              </p>
            </div>

            <div className="py-2 border-t-2">
              <p className="font-black text-lg">
                Total: {match.innings2.score}-{match.innings2.wickets} ({match.innings2.overs}) {match.matchSettings.overs}.0
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-t-0 border-green-600 p-4 overflow-x-auto">
            <h3 className="font-black text-black mb-3">Bowler</h3>
            <div className="min-w-full">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-600 mb-2 pb-2 border-b-2">
                <div className="col-span-4">Bowler</div>
                <div className="col-span-1 text-center">O</div>
                <div className="col-span-1 text-center">M</div>
                <div className="col-span-2 text-center">R</div>
                <div className="col-span-1 text-center">W</div>
                <div className="col-span-2 text-center">WD</div>
                <div className="col-span-1 text-right">ER</div>
              </div>

              {(innings2Batting === match.teamA ? teamBBowling : teamABowling).map((stat) => (
                <div key={stat.name} className="grid grid-cols-12 gap-2 py-2 text-xs border-b hover:bg-gray-50">
                  <div className="col-span-4 font-bold text-black">{stat.name}</div>
                  <div className="col-span-1 text-center">{stat.overs}</div>
                  <div className="col-span-1 text-center">{stat.maidens}</div>
                  <div className="col-span-2 text-center font-bold">{stat.runs}</div>
                  <div className="col-span-1 text-center font-bold text-red-600">{stat.wickets}</div>
                  <div className="col-span-2 text-center font-bold text-orange-600">{stat.wides}</div>
                  <div className="col-span-1 text-right font-bold">{stat.economy}</div>
                </div>
              ))}
            </div>
          </div>

          {innings2Wickets.length > 0 && (
            <div className="bg-white border-2 border-t-0 border-green-600 rounded-b-xl p-4">
              <h3 className="font-black text-black mb-3">Fall of wickets</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {innings2Wickets.map((wicket, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-bold">{wicket.batsman}</span>
                    <span className="ml-2 text-gray-600">{wicket.score}</span>
                    <span className="ml-2 text-gray-500">{wicket.over}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatchDetails;
