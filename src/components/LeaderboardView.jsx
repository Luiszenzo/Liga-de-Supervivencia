import React, { useState } from "react";
import { 
  Trophy, 
  Skull, 
  CheckCircle2, 
  Crown, 
  ChevronDown,
  ChevronUp,
  Shield,
  Users,
  TrendingUp
} from "lucide-react";
import { useLeague } from "../context/LeagueContext";
import { useAuth } from "../context/AuthContext";
import { getTeamById } from "../data/nflTeams";

const StatusBadge = ({ status, eliminatedWeek }) => {
  if (status === "champion") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10">
      <Crown className="w-3 h-3" /> CAMPEÓN
    </span>
  );
  if (status === "alive") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse-subtle">
      <CheckCircle2 className="w-3 h-3" /> VIVO
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
      <Skull className="w-3 h-3" /> SEM. {eliminatedWeek}
    </span>
  );
};

export const LeaderboardView = () => {
  const { user } = useAuth();
  const { players, selectedWeek, schedule, leagueStats } = useLeague();
  const [showMatrix, setShowMatrix] = useState(false);
  const [sortBy, setSortBy] = useState("status"); // 'status' | 'name'

  const sorted = [...players].sort((a, b) => {
    if (sortBy === "status") {
      const order = { champion: 0, alive: 1, eliminated: 2 };
      const diff = order[a.status] - order[b.status];
      if (diff !== 0) return diff;
      if (a.status === "eliminated" && b.status === "eliminated") {
        return (b.eliminatedWeek || 0) - (a.eliminatedWeek || 0);
      }
      return a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  // Build matrix of weeks 1 to current
  const matrixWeeks = Array.from({ length: selectedWeek }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      
      {/* Stats Overview (Mobile-friendly grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="p-3 sm:p-4 rounded-2xl metal-card border border-slate-700/50 text-center">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mx-auto mb-1" />
          <p className="text-xl sm:text-2xl font-display font-black text-white">{leagueStats.total}</p>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Jugadores</p>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl metal-card border border-emerald-500/20 text-center">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 mx-auto mb-1" />
          <p className="text-xl sm:text-2xl font-display font-black text-emerald-300">{leagueStats.alive}</p>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Vivos</p>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl metal-card border border-rose-500/20 text-center">
          <Skull className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 mx-auto mb-1" />
          <p className="text-xl sm:text-2xl font-display font-black text-rose-300">{leagueStats.eliminated}</p>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Eliminados</p>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl metal-card border border-amber-500/20 text-center">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mx-auto mb-1" />
          <p className="text-xl sm:text-2xl font-display font-black text-amber-300">{leagueStats.survivalRate}%</p>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Supervivencia</p>
        </div>
      </div>

      {/* Top Pick This Week */}
      {leagueStats.topPickTeam && (
        <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
          <img
            src={leagueStats.topPickTeam.logo}
            alt={leagueStats.topPickTeam.fullName}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-lg shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-blue-400 font-bold uppercase tracking-wider truncate">
              🔥 Más elegido — Sem. {selectedWeek}
            </p>
            <p className="text-sm sm:text-base font-display font-black text-white truncate">
              {leagueStats.topPickTeam.fullName}
            </p>
            <p className="text-[11px] text-slate-400">
              {leagueStats.topPickCount} jugador{leagueStats.topPickCount !== 1 ? "es" : ""} lo eligieron
            </p>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-base sm:text-lg text-white tracking-wide flex items-center gap-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          Posiciones
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSortBy("status")}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
              sortBy === "status" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Estado
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
              sortBy === "name" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Nombre
          </button>
        </div>
      </div>

      {/* Player List */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="text-center p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-display font-black text-white text-base">¡Aún no hay supervivientes registrados!</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Inicia sesión con tu cuenta de Google y sé el primero en hacer su selección semanal.
            </p>
          </div>
        ) : (
          sorted.map((player, index) => {
            const isMe = user && (player.id === user.uid || player.email === user.email);
            const totalPicks = Object.values(player.picks || {}).filter(Boolean).length;
            const currentPickTeam = player.picks?.[selectedWeek] ? getTeamById(player.picks[selectedWeek]) : null;

            return (
              <div
                key={player.id}
                className={`flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-4 rounded-2xl border transition-all ${
                  player.status === "champion"
                    ? "bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/10"
                    : player.status === "alive"
                    ? isMe
                      ? "bg-blue-500/10 border-blue-500/30 shadow-md shadow-blue-500/10"
                      : "bg-emerald-500/5 border-emerald-500/15"
                    : "bg-slate-900/40 border-slate-800/50 opacity-70"
                }`}
              >
                {/* Rank */}
                <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-[11px] sm:text-xs font-black ${
                  index === 0 && player.status === "champion"
                    ? "bg-amber-500/30 text-amber-300"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {player.status === "champion" ? "👑" : `#${index + 1}`}
                </div>

                {/* Avatar */}
                <img
                  src={player.avatar}
                  alt={player.name}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover flex-shrink-0 ${
                    isMe ? "ring-2 ring-blue-400/60" : "ring-1 ring-slate-700"
                  }`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${player.id}`;
                  }}
                />

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`font-bold text-xs sm:text-sm truncate ${isMe ? "text-blue-300" : "text-slate-100"}`}>
                      {player.name}
                    </p>
                    {isMe && (
                      <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1 py-0.2 rounded-full">
                        TÚ
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] sm:text-xs text-slate-400">
                      {totalPicks} pick{totalPicks !== 1 ? "s" : ""}
                    </p>
                    {player.status === "eliminated" && player.eliminatedReason && (
                      <p className="text-[9px] sm:text-[10px] text-rose-400/90 truncate hidden xs:inline sm:inline">
                        &bull; {player.eliminatedReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* This Week's Pick Mini-Badge */}
                {currentPickTeam ? (
                  <div className="flex-shrink-0 flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 px-2 py-1 rounded-xl" title={`Pick Sem ${selectedWeek}: ${currentPickTeam.fullName}`}>
                    <img
                      src={currentPickTeam.logo}
                      alt={currentPickTeam.name}
                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                    />
                    <span className="text-[10px] font-bold text-slate-300 hidden sm:inline">{currentPickTeam.name}</span>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
                    <span className="text-slate-600 text-xs sm:text-sm font-bold">?</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <StatusBadge status={player.status} eliminatedWeek={player.eliminatedWeek} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Survival Matrix Toggle */}
      <div>
        <button
          onClick={() => setShowMatrix(!showMatrix)}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/60 transition-colors text-sm font-bold text-slate-300"
        >
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Ver Matriz de Supervivencia Completa
          </span>
          {showMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMatrix && (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="sticky left-0 bg-slate-900 py-3 px-4 text-left font-bold text-slate-400 min-w-[130px]">Jugador</th>
                  {matrixWeeks.map((w) => (
                    <th key={w} className="py-3 px-3 text-center font-bold text-slate-500 whitespace-nowrap">
                      Sem.{w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sorted.map((player) => (
                  <tr key={player.id} className={`${
                    user && (player.id === user.uid || player.email === user.email)
                      ? "bg-blue-500/5"
                      : ""
                  }`}>
                    <td className="sticky left-0 bg-slate-900/90 py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={player.avatar}
                          alt=""
                          className="w-6 h-6 rounded-lg object-cover ring-1 ring-slate-700"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${player.id}`;
                          }}
                        />
                        <span className="font-semibold text-slate-300 truncate max-w-[80px]">{player.name.split(" ")[0]}</span>
                      </div>
                    </td>
                    {matrixWeeks.map((w) => {
                      const pick = player.picks?.[w];
                      const team = pick ? getTeamById(pick) : null;
                      const weekSchedule = schedule.find((sc) => sc.week === w);
                      const game = weekSchedule?.games?.find((g) => g.homeTeam === pick || g.awayTeam === pick);
                      const won = game?.winner === pick;
                      const lost = game?.winner && game?.winner !== pick;
                      const isElimWeek = player.status === "eliminated" && player.eliminatedWeek === w;

                      return (
                        <td key={w} className="py-2 px-3 text-center">
                          {team ? (
                            <div className={`flex flex-col items-center gap-0.5 rounded-lg p-1 ${
                              isElimWeek 
                                ? "bg-rose-500/20 border border-rose-500/30" 
                                : won 
                                ? "bg-emerald-500/10" 
                                : lost 
                                ? "bg-rose-500/10 opacity-60"
                                : "bg-slate-800/40"
                            }`}>
                              <img src={team.logo} alt="" className="w-6 h-6 object-contain" />
                              <span className="text-[9px] font-bold text-slate-400">{team.id}</span>
                              {game?.winner && (
                                <span className={`text-[9px] font-black ${won ? "text-emerald-400" : "text-rose-400"}`}>
                                  {won ? "✓" : "✗"}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center ${
                              player.status === "eliminated" && (player.eliminatedWeek || 0) < w
                                ? "bg-slate-800/30"
                                : "bg-slate-800/20"
                            }`}>
                              <span className="text-slate-600 text-base">
                                {player.status === "eliminated" && (player.eliminatedWeek || 0) < w ? "💀" : "—"}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
