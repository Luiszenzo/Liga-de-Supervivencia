import React from "react";
import { 
  Skull, 
  Trophy, 
  CheckCircle2, 
  Lock, 
  AlertTriangle,
  Flame,
  Star,
  LogIn
} from "lucide-react";
import { useLeague } from "../context/LeagueContext";
import { useAuth } from "../context/AuthContext";
import { getTeamById } from "../data/nflTeams";

export const HeroStatusBanner = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const { currentPlayer, currentWeekPick, selectedWeek, leagueStats } = useLeague();

  if (!user) {
    return (
      <div className="relative overflow-hidden p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 shadow-xl shadow-blue-500/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-indigo-600/10 rounded-full filter blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="text-3xl sm:text-5xl mb-2 font-display">🏈</div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-wide uppercase mb-1.5 sm:mb-2">
            LIGA DE SUPERVIVENCIA
          </h1>
          <p className="text-slate-300 text-xs sm:text-base max-w-lg mx-auto mb-4 leading-relaxed">
            Elige 1 equipo ganador por semana &bull; Sin repetir nunca &bull; ¡Sé el último en pie!
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-semibold text-slate-400 mb-4 sm:mb-6">
            <span className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 1 Pick Semanal</span>
            <span className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50"><Lock className="w-3.5 h-3.5 text-rose-400" /> Sin Repetición</span>
            <span className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50"><Trophy className="w-3.5 h-3.5 text-amber-400" /> {leagueStats.alive} Vivos</span>
          </div>
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 font-black text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all transform active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            Entrar y Competir
          </button>
        </div>
      </div>
    );
  }

  const myPick = currentWeekPick ? getTeamById(currentWeekPick) : null;

  return (
    <div className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl border transition-all ${
      currentPlayer?.status === "champion"
        ? "bg-gradient-to-br from-amber-900/30 to-slate-900 border-amber-500/30 shadow-xl shadow-amber-500/10"
        : currentPlayer?.status === "eliminated"
        ? "bg-gradient-to-br from-rose-900/20 to-slate-900 border-rose-500/20"
        : "bg-gradient-to-br from-emerald-900/20 via-slate-900/60 to-slate-900 border-emerald-500/20 shadow-lg shadow-emerald-500/5"
    }`}>
      
      {/* BG Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {currentPlayer?.status === "alive" && (
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-600/8 rounded-full filter blur-3xl" />
        )}
        {currentPlayer?.status === "champion" && (
          <>
            <div className="absolute -top-10 left-1/4 w-56 h-56 bg-amber-500/10 rounded-full filter blur-3xl" />
            <div className="absolute -bottom-10 right-1/4 w-48 h-48 bg-amber-500/8 rounded-full filter blur-3xl" />
          </>
        )}
      </div>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={user.photoURL}
            alt={user.name}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ${
              currentPlayer?.status === "champion" ? "ring-amber-400/60" :
              currentPlayer?.status === "eliminated" ? "ring-rose-500/40" :
              "ring-emerald-400/40"
            }`}
            referrerPolicy="no-referrer"
          />
          <div className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full ring-2 ring-slate-900 flex items-center justify-center text-sm ${
            currentPlayer?.status === "champion" ? "bg-amber-500" :
            currentPlayer?.status === "eliminated" ? "bg-rose-600" :
            "bg-emerald-500"
          }`}>
            {currentPlayer?.status === "champion" ? "👑" :
             currentPlayer?.status === "eliminated" ? "💀" : "🏈"}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-black text-lg sm:text-xl text-white truncate">{user.name}</p>
            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
              currentPlayer?.status === "champion"
                ? "text-amber-300 bg-amber-500/20 border-amber-500/40"
                : currentPlayer?.status === "eliminated"
                ? "text-rose-300 bg-rose-500/10 border-rose-500/20"
                : "text-emerald-300 bg-emerald-500/15 border-emerald-500/30 animate-pulse-subtle"
            }`}>
              {currentPlayer?.status === "champion" ? "🏆 CAMPEÓN DE LA LIGA"
               : currentPlayer?.status === "eliminated" ? `💀 ELIMINADO · Semana ${currentPlayer.eliminatedWeek}`
               : "🟢 SUPERVIVIENTE ACTIVO"}
            </span>
          </div>

          {currentPlayer?.status === "eliminated" && currentPlayer.eliminatedReason && (
            <p className="text-xs text-rose-400 mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              {currentPlayer.eliminatedReason}
            </p>
          )}

          {currentPlayer?.status !== "eliminated" && (
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {Object.values(currentPlayer?.picks || {}).filter(Boolean).length} pick{Object.values(currentPlayer?.picks || {}).filter(Boolean).length !== 1 ? "s" : ""} realizados
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                {Object.values(currentPlayer?.picks || {}).filter(Boolean).length} equipo{Object.values(currentPlayer?.picks || {}).filter(Boolean).length !== 1 ? "s" : ""} bloqueado{Object.values(currentPlayer?.picks || {}).filter(Boolean).length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Current Week Pick Display */}
        {myPick && currentPlayer?.status !== "eliminated" && (
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">
              Pick Sem. {selectedWeek}
            </span>
            <img src={myPick.logo} alt={myPick.fullName} className="w-12 h-12 object-contain drop-shadow-xl" />
            <span className="text-xs font-display font-black text-white">{myPick.name}</span>
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold">
              <Star className="w-2.5 h-2.5" /> CONFIRMADO
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
