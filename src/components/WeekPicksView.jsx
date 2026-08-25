import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Star, 
  AlertTriangle, 
  ChevronRight,
  Zap
} from "lucide-react";
import { useLeague } from "../context/LeagueContext";
import { useAuth } from "../context/AuthContext";
import { NFL_TEAMS, getTeamById } from "../data/nflTeams";

const getRatingColor = (rating) => {
  if (rating >= 92) return "text-emerald-400";
  if (rating >= 87) return "text-blue-400";
  if (rating >= 82) return "text-amber-400";
  return "text-slate-400";
};

const getRatingBg = (rating) => {
  if (rating >= 92) return "bg-emerald-500/10 border-emerald-500/20";
  if (rating >= 87) return "bg-blue-500/10 border-blue-500/20";
  if (rating >= 82) return "bg-amber-500/10 border-amber-500/20";
  return "bg-slate-700/50 border-slate-600/30";
};

export const WeekPicksView = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const {
    selectedWeek,
    setSelectedWeek,
    schedule,
    currentPlayer,
    usedTeamIds,
    currentWeekPick,
    makePick,
    isCommissioner,
    isCommissionerMode,
    setGameResult,
    correctGameResult,
    simulateFullWeek
  } = useLeague();

  const [confirmTeam, setConfirmTeam] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const weekData = schedule.find((w) => w.week === selectedWeek);
  const games = weekData?.games || [];

  // All teams that appear in this week's matchups
  const teamsInWeek = new Set();
  games.forEach((g) => {
    teamsInWeek.add(g.homeTeam);
    teamsInWeek.add(g.awayTeam);
  });

  const handlePickTeam = (teamId) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (currentPlayer?.status === "eliminated") {
      setError(`Estás eliminado desde la Semana ${currentPlayer.eliminatedWeek}. ¡Hasta la próxima temporada!`);
      return;
    }
    setConfirmTeam(teamId);
    setError(null);
  };

  const handleConfirmPick = () => {
    if (!confirmTeam) return;
    try {
      makePick(selectedWeek, confirmTeam);
      const team = getTeamById(confirmTeam);
      setSuccessMsg(`¡Pick confirmado! ${team?.fullName} seleccionado para la Semana ${selectedWeek}.`);
      setConfirmTeam(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.message);
      setConfirmTeam(null);
    }
  };

  const handleSetWinner = (game, winnerTeamId) => {
    setGameResult(selectedWeek, game.id, winnerTeamId);
  };

  const handleSimulate = () => {
    simulateFullWeek(selectedWeek);
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Week Selector Carousel (Touch friendly, snap scrolling) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 no-scrollbar snap-x snap-mandatory">
        {Array.from({ length: 18 }, (_, i) => i + 1).map((wk) => {
          const wkData = schedule.find((w) => w.week === wk);
          const isFinished = wkData?.games?.every((g) => g.winner);
          const myPick = currentPlayer?.picks?.[wk];
          
          return (
            <button
              key={wk}
              onClick={() => setSelectedWeek(wk)}
              className={`flex flex-col items-center justify-center shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-xs font-bold transition-all duration-200 border snap-center ${
                selectedWeek === wk
                  ? "bg-gradient-to-b from-blue-600 to-indigo-700 text-white border-blue-400/50 shadow-xl shadow-blue-500/25 scale-105"
                  : isFinished
                  ? "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-700/60 active:scale-95"
                  : "bg-slate-900/80 text-slate-500 border-slate-800 hover:bg-slate-800/80 hover:text-slate-300 active:scale-95"
              }`}
            >
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Sem</span>
              <span className="text-base sm:text-lg font-display font-black leading-none">{wk}</span>
              {myPick && (
                <div className="w-1.5 h-1.5 rounded-full mt-0.5 bg-emerald-400 shadow-sm shadow-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Week Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl metal-card border border-slate-700/50">
        <div>
          <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wide">
            {weekData?.title || `Semana ${selectedWeek}`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentWeekPick ? (
              <>
                Tu pick:{" "}
                <span className="text-emerald-400 font-bold">
                  {getTeamById(currentWeekPick)?.fullName || currentWeekPick}
                </span>
                {" "}&bull; ¡Bloqueado para futuras semanas!
              </>
            ) : currentPlayer?.status === "eliminated" ? (
              <span className="text-rose-400 font-semibold">
                Eliminado en Semana {currentPlayer.eliminatedWeek}
              </span>
            ) : (
              "Elige 1 equipo para ganar esta semana"
            )}
          </p>
        </div>

        {/* Commissioner Quick Actions (Authorized admins only) */}
        {isCommissioner && isCommissionerMode && (
          <button
            onClick={handleSimulate}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Simular Semana {selectedWeek}
          </button>
        )}
      </div>

      {/* Error / Success Messages */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm animate-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-200">×</button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Confirm Pick Modal Overlay */}
      {confirmTeam && (() => {
        const team = getTeamById(confirmTeam);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-center">
              <img src={team?.logo} alt={team?.fullName} className="w-20 h-20 object-contain mx-auto mb-3 drop-shadow-xl" />
              <h3 className="font-display font-black text-xl text-white mb-1">¿Confirmar Pick?</h3>
              <p className="text-sm text-slate-400 mb-1">
                <span className="text-white font-bold">{team?.fullName}</span> — Semana {selectedWeek}
              </p>
              <p className="text-xs text-amber-400 font-semibold mb-5 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Este equipo quedará BLOQUEADO para semanas futuras
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmTeam(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPick}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition-all"
                >
                  ¡Confirmar!
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Games Grid */}
      <div className="grid grid-cols-1 gap-3">
        {games.map((game) => {
          const homeTeam = getTeamById(game.homeTeam);
          const awayTeam = getTeamById(game.awayTeam);
          const isFinished = game.status === "finished" || game.winner;
          const homeWon = game.winner === game.homeTeam;
          const awayWon = game.winner === game.awayTeam;
          const myPickThisGame = currentWeekPick === game.homeTeam || currentWeekPick === game.awayTeam;
          const homeUsed = usedTeamIds.includes(game.homeTeam);
          const awayUsed = usedTeamIds.includes(game.awayTeam);

          const renderTeamPick = (team, isHome) => {
            const isUsed = isHome ? homeUsed : awayUsed;
            const isCurrentPick = currentWeekPick === team?.id;
            const won = isHome ? homeWon : awayWon;
            const lost = isFinished && !won;
            const isMyPick = isCurrentPick;

            return (
              <div key={team?.id} className="flex flex-col items-center gap-1.5 w-full min-w-0">
                {/* Team pick button */}
                <button
                  onClick={() => {
                    if (!isFinished && !isUsed && !isCurrentPick && currentPlayer?.status !== "eliminated") {
                      handlePickTeam(team?.id);
                    }
                  }}
                  disabled={isFinished || isUsed || isCurrentPick}
                  className={`
                    relative flex flex-col items-center justify-between gap-1.5 p-2.5 sm:p-4 rounded-2xl border transition-all duration-200 group w-full min-h-[140px] sm:min-h-[165px]
                    ${isCurrentPick 
                      ? "metal-card-active shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/50 scale-[1.02]" 
                      : isUsed 
                      ? "metal-card-locked opacity-50 cursor-not-allowed" 
                      : isFinished 
                      ? won 
                        ? "bg-emerald-500/10 border-emerald-500/30" 
                        : "bg-rose-500/5 border-rose-500/20 opacity-50"
                      : "metal-card hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer active:scale-95"}
                  `}
                >
                  {/* Used Badge */}
                  {isUsed && (
                    <div className="absolute -top-2 -right-1 sm:-right-2 flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-600 text-white shadow-md z-10">
                      <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> USADO
                    </div>
                  )}

                  {/* Winner Badge */}
                  {isFinished && won && !isMyPick && (
                    <div className="absolute -top-2 -right-1 sm:-right-2 flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-md z-10">
                      <CheckCircle2 className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> GANÓ
                    </div>
                  )}

                  {isCurrentPick && (
                    <div className="absolute -top-2 -right-1 sm:-right-2 flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 shadow-lg z-10 animate-pulse-subtle">
                      <Star className="w-2.5 h-2.5" /> MI PICK
                    </div>
                  )}

                  {/* Team Logo */}
                  <div className="relative mt-1">
                    <img 
                      src={team?.logo} 
                      alt={team?.fullName}
                      className={`w-11 h-11 sm:w-16 sm:h-16 object-contain drop-shadow-md transition-transform ${
                        !isUsed && !isFinished && !isCurrentPick ? "group-hover:scale-110 group-active:scale-95" : ""
                      }`}
                    />
                  </div>

                  {/* Team Info */}
                  <div className="text-center w-full px-0.5">
                    <p className="font-display font-black text-xs sm:text-sm text-white tracking-wide truncate">{team?.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">{team?.city}</p>
                    <div className={`mt-0.5 inline-block text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.2 rounded-full border ${getRatingBg(team?.rating || 80)} ${getRatingColor(team?.rating || 80)}`}>
                      ⭐ {team?.rating}
                    </div>
                  </div>

                  {/* Score (if game finished) */}
                  {isFinished && (
                    <div className={`text-xl sm:text-2xl font-display font-black mt-auto ${won ? "text-emerald-400" : "text-slate-500"}`}>
                      {isHome ? game.homeScore : game.awayScore}
                    </div>
                  )}
                </button>

                {/* Commissioner action buttons */}
                {isCommissioner && isCommissionerMode && (
                  <div className="flex flex-col gap-1 items-center w-full mt-0.5">
                    {!isFinished && (
                      <button
                        onClick={() => handleSetWinner(game, team?.id)}
                        className="w-full text-[9px] sm:text-[10px] font-bold py-1.5 px-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/40 active:scale-95 transition-all"
                      >
                        ✓ Ganador
                      </button>
                    )}
                    {isFinished && !won && (
                      <button
                        onClick={() => correctGameResult(selectedWeek, game.id, team?.id)}
                        className="w-full text-[8px] sm:text-[9px] font-bold py-1 px-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 active:scale-95 transition-all truncate"
                      >
                        🔄 Cambiar
                      </button>
                    )}
                    {isFinished && won && (
                      <button
                        onClick={() => correctGameResult(selectedWeek, game.id, null)}
                        className="w-full text-[8px] sm:text-[9px] font-bold py-1 px-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/25 hover:bg-rose-500/25 active:scale-95 transition-all"
                      >
                        ✕ Deshacer
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          };

          return (
            <div
              key={game.id}
              className={`p-3 sm:p-4 rounded-2xl border transition-all duration-200 ${
                myPickThisGame && !isFinished 
                  ? "border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/10" 
                  : "border-slate-800/60 bg-slate-900/60"
              }`}
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-2 sm:mb-3 text-[10px] sm:text-[11px] text-slate-400 font-medium">
                <span className="truncate max-w-[180px] sm:max-w-none flex items-center gap-1">
                  🏟 {game.stadium}
                </span>
                <span className="shrink-0 text-slate-500">{game.date}</span>
              </div>

              {/* Teams Layout */}
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-1.5 sm:gap-3">
                {renderTeamPick(awayTeam, false)}

                {/* VS Separator */}
                <div className="flex flex-col items-center gap-0.5 sm:gap-1 px-1">
                  <span className="font-display font-black text-slate-500 text-xs sm:text-sm">VS</span>
                  {!isFinished && (
                    <div className="text-[9px] sm:text-[10px] text-slate-500 text-center font-medium leading-tight">
                      {game.spread}
                    </div>
                  )}
                  {isFinished && (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  )}
                  <div className="text-[8px] sm:text-[9px] text-slate-500 text-center font-bold">LOCAL</div>
                </div>

                {renderTeamPick(homeTeam, true)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
